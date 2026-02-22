import { useEffect, useState } from "react";
import { pingBackend } from "./api/testService"

function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    pingBackend()
      .then(data => setMessage(data))
      .catch(() => setMessage("Connection failed"));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Spring Boot + React (Axios)</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App;