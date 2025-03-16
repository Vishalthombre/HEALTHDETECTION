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
      console.log("Fetching from API:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      const text = await response.text();
      console.log("Raw Response:", text);

      if (!response.ok) {
        throw new Error(`Failed to fetch health data: ${response.status} - ${response.statusText}`);
      }

      const data = JSON.parse(text);
      console.log("Parsed Data Object:", data);

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
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 px-3">
      <div className="card shadow-lg p-3 p-md-4 w-100" style={{ maxWidth: "600px" }}>
        <h2 className="text-center mb-3">Health Report</h2>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-danger text-center">{error}</p>}

        {healthData && (
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <h4>Vitals</h4>
            <p><strong>Pulse Rate:</strong> {healthData?.data?.pulseRate}</p>
            <p><strong>Heart Rate:</strong> {healthData?.data?.heartRate}</p>
            <p><strong>Body Temperature:</strong> {healthData?.data?.bodyTemperature} °F</p>

            <h4 className="mt-3">Possible Diagnosis</h4>
            <div className="bg-light p-2 rounded border shadow-sm overflow-auto" style={{ maxHeight: "150px" }}>
              <ul className="list-unstyled mb-0">
                {healthData?.diagnosis
                  ? healthData.diagnosis.split("\n").map((disease, index) => (
                      <li key={index}>{disease}</li>
                    ))
                  : <li>No diagnosis available</li>}
              </ul>
            </div>

            {healthData?.alertStatus && (
              <div className={`alert ${getAlertClass(healthData.isCritical)} mt-4`} role="alert">
                {healthData.alertStatus}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-3">
          <button className="btn btn-primary w-100" onClick={fetchHealthData}>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;
