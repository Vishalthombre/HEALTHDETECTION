const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());  // Enable CORS for all requests

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const ALERT_PHONE_NUMBER = process.env.ALERT_PHONE_NUMBER;

// Gemini AI API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });

// Sample health data (including both normal and critical conditions)
const sampleData = [
    { pulseRate: 140, heartRate: 130, bodyTemperature: 104.5 },
    { pulseRate: 135, heartRate: 125, bodyTemperature: 104.0 },
    { pulseRate: 145, heartRate: 135, bodyTemperature: 105.0 },
    { pulseRate: 75, heartRate: 72, bodyTemperature: 98.6 }, // Normal condition
    { pulseRate: 120, heartRate: 110, bodyTemperature: 101.2 }, // Normal condition
    { pulseRate: 95, heartRate: 80, bodyTemperature: 99.5 }   // Normal condition
];

// Function to fetch diagnosis with Gemini AI
async function fetchDiagnosis(prompt) {
    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        return result.response.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return "Error processing diagnosis";
    }
}

// Process health data only when requested
app.get("/process-health-data", async (req, res) => {
    try {
        // Randomly select one sample data entry (critical or normal condition)
        const randomData = sampleData[Math.floor(Math.random() * sampleData.length)];
        const { pulseRate, heartRate, bodyTemperature } = randomData;

        const prompt = `Patient data:\nPulse Rate: ${pulseRate}\nHeart Rate: ${heartRate}\nBody Temperature: ${bodyTemperature}\nWhat possible diseases could be indicated? Provide only the disease name.`;
        const diagnosis = await fetchDiagnosis(prompt);

        let alertStatus = "No alert sent.";
        let alertSent = false;

        // Check if critical condition is met
        const isCritical = bodyTemperature > 103 || heartRate < 50 || heartRate > 120 || pulseRate > 130 || pulseRate < 50;

        if (isCritical) {
            try {
                // Attempt to send alert
                await twilioClient.messages.create({
                    body: `🚨 URGENT: Critical health condition detected!\nPossible Diagnosis: ${diagnosis}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: ALERT_PHONE_NUMBER,
                });
                alertSent = true;
                alertStatus = "Critical condition detected. Alert sent to emergency contact.";
            } catch (error) {
                // Log the exact error message and code
                console.error("Twilio Error:", error.message);

                // Check if error is related to rate limits or daily message limits
                if (error.code === 21614) {
                    alertStatus = "Critical condition occurred, but alert limit exceeded. No alert sent.";
                } else if (error.message.includes("exceeded the null daily messages limit")) {
                    alertStatus = "Critical condition detected but no alert sent. Alert limit exceeded for today.";
                } else {
                    alertStatus = `Error sending alert: ${error.message}`;
                }
            }
        } else {
            alertStatus = "Normal condition detected. No alert sent.";
        }

        // Respond with health data, diagnosis, alert status, and alert sent status
        res.json({ message: "Health data processed successfully.", data: randomData, diagnosis, alertStatus, alertSent });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Error processing health data" });
    }
});

// Error handling middleware for any uncaught errors
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
