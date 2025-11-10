"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const AceEditor = dynamic(async () => await import("react-ace"), { ssr: false });

// import modes and themes
import 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

export default function Home() {
  const [espId, setEspId] = useState("");
  const [code, setCode] = useState("# Write your code here...");
  const [status, setStatus] = useState("");

  const snippets: Record<string, string> = {
    servo: "from machine import Pin, PWM\nservo = PWM(Pin(15), freq=50)\nservo.duty(77)",
    ultrasonic: "from hcsr04 import HCSR04\nsensor = HCSR04(trigger_pin=5, echo_pin=18)\ndistance = sensor.distance_cm()",
  };

  const insertSnippet = (type: string) => setCode((prev) => prev + "\n" + snippets[type] + "\n");

  const uploadCode = async () => {
    if (!espId) return alert("Please enter ESP32 ID.");
    setStatus("Uploading...");
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: espId, code }),
    });
    const msg = await res.text();
    setStatus(msg);
  };

  const saveVersion = () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`esp32_code_${timestamp}`, code);
    alert("Saved version locally.");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ESP32 Web IDE</h2>
      <input
        className="border p-2 mb-2 w-full"
        placeholder="ESP32 ID (e.g., esp32-001)"
        value={espId}
        onChange={(e) => setEspId(e.target.value)}
      />
      <div className="flex gap-2 mb-3">
        <button onClick={() => insertSnippet("servo")}>Servo Snippet</button>
        <button onClick={() => insertSnippet("ultrasonic")}>Ultrasonic</button>
        <button onClick={uploadCode}>Upload</button>
        <button onClick={saveVersion}>Save</button>
      </div>
      <AceEditor
        mode="python"
        theme="github"
        value={code}
        onChange={setCode}
        name="editor"
        width="100%"
        height="400px"
        fontSize={14}
        setOptions={{ useWorker: false }}
      />
      <div className="mt-3 text-sm text-gray-600">{status}</div>
    </div>
  );
}
