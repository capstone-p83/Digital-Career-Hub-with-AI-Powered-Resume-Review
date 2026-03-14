"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5001/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setMessage("Failed to connect backend");
      });
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>P83 Project Test</h1>
      <p>Backend message:</p>
      <h2>{message}</h2>
    </main>
  );
}