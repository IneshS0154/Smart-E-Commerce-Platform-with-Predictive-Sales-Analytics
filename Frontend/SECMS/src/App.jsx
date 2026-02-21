import { useEffect, useState } from "react";
import './App.css'

function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    fetch("http://localhost:8080/api/ping")
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => {
        console.error("Error:", error);
        setMessage("Connection failed");
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Spring Boot + React</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App
