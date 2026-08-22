import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.text())
      .then(() => setStatus("connected"))
      .catch(() => setStatus("disconnected"));
  }, []);

  return (
    <>
      <p>HELLO FRONTEND</p>
      {status === "checking" ? (
        <p>Checking backend connection...</p>
      ) : status === "connected" ? (
        <p>Connected to backend at {API_URL}/</p>
      ) : (
        <p>Not connected to backend at {API_URL}/</p>
      )}
    </>
  );
}

export default App;
