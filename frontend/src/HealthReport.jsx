import React, { useState, useEffect } from "react";

const HealthReport = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/process-health-data`;
      console.log("Fetching from API:", apiUrl); // ✅ Logs the API URL

      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json", // ✅ Ensure response is JSON
        },
      });

      const text = await response.text(); // Read response as text
      console.log("Raw Response:", text); // ✅ Logs raw response

      if (!response.ok) {
        throw new Error(`Failed to fetch health data: ${response.status} - ${response.statusText}`);
      }

      const data = JSON.parse(text); // Convert text to JSON
      console.log("Parsed Data Object:", data); // ✅ Logs parsed JSON

      setHealthData(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getAlertClass = (isCritical) => (isCritical ? "alert-danger" : "alert-success");

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ width: "40rem", maxHeight: "80vh", overflow: "hidden" }}
      >
        <h2 className="text-center mb-3">Health Report</h2>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-danger text-center">{error}</p>}

        {healthData && healthData.data && (
          <div className="flex-grow-1" style={{ overflowY: "auto" }}>
            <h4>Vitals</h4>
            <p><strong>Pulse Rate:</strong> {healthData?.data?.pulseRate}</p>
            <p><strong>Heart Rate:</strong> {healthData?.data?.heartRate}</p>
            <p><strong>Body Temperature:</strong> {healthData?.data?.bodyTemperature} °F</p>

            <h4 className="mt-3">Possible Diagnosis</h4>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
                border: "1px solid #ddd",
              }}
            >
              <ul className="list-unstyled">
                {healthData?.data?.diagnosis
                  ? healthData.data.diagnosis.split("\n").map((disease, index) => (
                      <li key={index}>{disease}</li>
                    ))
                  : <li>No diagnosis available</li>}
              </ul>
            </div>

            {healthData?.data?.alertStatus && (
              <div className={`alert ${getAlertClass(healthData.isCritical)} mt-4`} role="alert">
                {healthData.data.alertStatus}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-3">
          <button className="btn btn-primary" onClick={fetchHealthData}>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;
