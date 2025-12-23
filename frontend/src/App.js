import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { FiRefreshCw, FiCheckCircle, FiAlertCircle, FiZap } from "react-icons/fi";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Idle");
  const [used, setUsed] = useState(0);
  const [times, setTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT = 5;

  const callApi = async () => {
    const start = performance.now();
    setStatus("Loading...");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8083/api/test", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      const end = performance.now();
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: errorText
        });
        
        if (res.status === 429) {
          setStatus("Rate limit exceeded");
          setUsed(LIMIT);
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
      }

      const data = await res.text();
      console.log("Response data:", data); // Debug log
      
      setTimes(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), ms: Math.round(end - start) }
      ]);
      setStatus("Request successful!");
      setUsed(prev => Math.min(prev + 1, LIMIT));
    } catch (error) {
      console.error("Error calling API:", error);
      setStatus("Error: " + (error.message || "Could not connect to backend"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <FiZap className="logo-icon" />
          <h1>API Rate Limiter</h1>
        </div>
        <p className="subtitle">Spring Boot + React</p>
      </header>

      <main className="main-content">
        <div className="card">
          <div className="api-controls">
            <button 
              onClick={callApi} 
              disabled={isLoading}
              className="api-button"
            >
              {isLoading ? (
                <><FiRefreshCw className="spin" /> Loading...</>
              ) : (
                'Call API Endpoint'
              )}
            </button>
            <div className={`status ${status.includes('Error') ? 'error' : 'success'}`}>
              {status.includes('success') && <FiCheckCircle className="status-icon" />}
              {status.includes('Error') && <FiAlertCircle className="status-icon" />}
              {status}
            </div>
          </div>

          <div className="usage-container">
            <div className="usage-header">
              <span>API Usage</span>
              <span>{used} of {LIMIT} requests</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(used / LIMIT) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="chart-container">
            <h3>Response Time History</h3>
            {times.length > 0 ? (
              <div className="chart">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={times}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="ms" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="no-data">No data yet. Make some API calls!</div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>API Rate Limiter Demo • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;