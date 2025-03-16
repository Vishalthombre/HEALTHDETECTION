import React, { useState, useEffect } from "react";

const HealthReport = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/process-health-data");
      if (!response.ok) {
        throw new Error("Failed to fetch health data.");
      }
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getAlertClass = (isCritical) => {
    if (isCritical) {
      return "alert-danger";  // Red alert for critical condition
    }
    return "alert-success";  // Green alert for normal condition
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4 d-flex flex-column"
        style={{
          width: "40rem",
          maxHeight: "80vh", // Restrict the max height of the card
          overflow: "hidden", // Hide overflow for the entire card
        }}
      >
        <h2 className="text-center mb-3">Health Report</h2>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : healthData ? (
          <div className="flex-grow-1" style={{ overflowY: "auto" }}>
            {/* Vitals */}
            <h4>Vitals</h4>
            <p><strong>Pulse Rate:</strong> {healthData.data.pulseRate}</p>
            <p><strong>Heart Rate:</strong> {healthData.data.heartRate}</p>
            <p><strong>Body Temperature:</strong> {healthData.data.bodyTemperature} °F</p>

            {/* Diagnosis Box */}
            <h4 className="mt-3">Possible Diagnosis</h4>
            <div
              style={{
                maxHeight: "150px", // Set a fixed height for the diagnosis box
                overflowY: "auto",  // Enable vertical scrolling if needed
                padding: "10px",
                backgroundColor: "#f8f9fa", // Light background color
                borderRadius: "8px",
                boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
                border: "1px solid #ddd",
              }}
            >
              <ul className="list-unstyled">
                {healthData.diagnosis.split("\n").map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
            </div>

            {/* Add space between diagnosis and alert */}
            {healthData.alertStatus && (
              <div className={`alert ${getAlertClass(healthData.isCritical)} mt-4`} role="alert">
                {healthData.alertStatus}
              </div>
            )}
          </div>
        ) : null}

        {/* Refresh Data Button at the bottom */}
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
