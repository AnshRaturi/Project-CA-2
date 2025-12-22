import React, { useState } from "react";
import "./App.css";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const LIMIT = 5;

function App() {
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [used, setUsed] = useState(0);
  const [dark, setDark] = useState(false);
  const [responseTimes, setResponseTimes] = useState([]);

  const callApi = async () => {
    try {
      const start = performance.now();

      const res = await fetch("http://localhost:8081/api/test");
      const text = await res.text();

      const end = performance.now();
      const duration = Math.round(end - start);

      setMessage(text);
      setCount((prev) => prev + 1);
      setUsed((prev) => Math.min(prev + 1, LIMIT));

      setResponseTimes((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), ms: duration }
      ]);
    } catch (err) {
      setMessage("Backend not reachable");
    }
  };

  return (
    <div className={`container ${dark ? "dark" : ""}`}>
      <motion.div
        className="card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>🚦 API Rate Limiter Demo</h1>
        <p className="subtitle">Spring Boot + Redis + Docker</p>

        <button className="toggle" onClick={() => setDark(!dark)}>
          {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>

        <button onClick={callApi}>Call API</button>

        {message && (
          <div className={`status ${message.includes("Too") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${(used / LIMIT) * 100}%`,
              background: used >= LIMIT ? "#dc2626" : "#22c55e"
            }}
          />
        </div>
        <p className="limit-text">{used}/{LIMIT} requests used</p>

        <h3>Total Requests: {count}</h3>

        {/* Response Time Graph */}
        <h4>API Response Time (ms)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={responseTimes}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ms" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>

        <p className="footer">Rate limiting using Redis</p>
      </motion.div>
    </div>
  );
}

export default App;