"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Framer Motion imports
import { AnimatePresence, motion } from "motion/react"


const AceEditor = dynamic(async () => await import("react-ace"), { ssr: false });

// Ace Editor imports
import 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

export default function Home() {
  const [espId, setEspId] = useState("");
  const [code, setCode] = useState("# Write your code here...");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(1);

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
    <div className="font-sans relative overflow-hidden w-full h-screen bg-[#0C2B4E]">
      <AnimatePresence>
      {/* Onboarding */}
      { step === 1 && (<motion.div animate={{ opacity: 1}} initial={{ opacity: 0 }} exit={{opacity: 0, zIndex: 100, scale:1.2, transition: {duration: 1, ease: "easeIn"}}} className="bg-[#0C2B4E] w-full h-full flex items-center justify-center gap-24 p-12 absolute inset-0">
        <motion.div className="rounded-full h-[50vw] w-[50vw] bg-[#747474] absolute -top-84 left-10 blur-[200px] z-0"/>
        <motion.div className="rounded-full h-[50vw] w-[50vw] bg-[#1D546C] absolute -bottom-10 -right-20 blur-[200px] z-0"/>
        <motion.div className="flex items-center justify-center gap-24 bg-slate-300/20 h-full w-full rounded-4xl flex-col z-10 shadow-2xl">
        <h1 className="font-semibold text-8xl text-center">ESP32<br />Onboarding</h1>
        <button onClick={()=>setStep(2)} className="rounded-full h-24 w-24 bg-[#D9D9D9]/50 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          </button></motion.div>
      </motion.div>)}
      </AnimatePresence>

      <AnimatePresence>
      {/* Onboarding */}
      { step === 2 && (<motion.div animate={{ opacity: 1, scale:1, transition: { duration: 1, ease: "easeIn"}}} initial={{ opacity: 0, scale: 0.9}} exit={{opacity: 0, filter: "blur(20px)", transition: {duration: 1, ease: "easeIn"}}} className="bg-[#0C2B4E] w-full h-full flex items-center justify-center gap-24 p-12 absolute inset-0">
        <motion.div className="rounded-full h-[50vw] w-[50vw] bg-[#747474] absolute -top-84 left-10 blur-[200px] z-0"/>
        <motion.div className="rounded-full h-[50vw] w-[50vw] bg-[#1D546C] absolute -bottom-10 -right-20 blur-[200px] z-0"/>
        <motion.div className="flex items-center justify-center gap-12 bg-slate-300/20 h-full w-full rounded-4xl flex-col z-10 shadow-2xl">
        <h2 className="font-semibold text-6xl text-center">Device name</h2>
        <input type="text" placeholder="ESP32 ID (e.g., esp32-001)" className="outline-none border-b p-2 w-56" value={espId}
        onChange={(e) => setEspId(e.target.value)} />
        <button type="submit" onClick={()=>setStep(3)} className="rounded-full h-16 w-16 bg-[#D9D9D9]/50 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          </button></motion.div>
      </motion.div>)}
      </AnimatePresence>

      {/* IDE */}
      { step === 3 && (<motion.div animate={{ opacity: 1}} initial={{ opacity: 0 }} transition={{duration: 1, ease: "easeIn"}} exit={{opacity: 0}} className="p-6 grid grid-cols-4 h-full">
      <div className="col-span-1 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4">ESP32 Web IDE</h2>
      <p>Device Name: <span className="font-semibold">{espId}</span></p>
      <a onClick={()=>setStep(2)} className="underline mb-4">Change Device Name</a>
      <div className="flex flex-col gap-2 items-start">
        {/*<button onClick={() => insertSnippet("servo")} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Servo Snippet</button>
        <button onClick={() => insertSnippet("ultrasonic")} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Ultrasonic</button>*/}
        <button onClick={uploadCode} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Upload</button>
        <div className="mt-3 text-sm text-gray-300">{status}  
            </div>
        {/*<button onClick={saveVersion} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Save</button>*/}
      </div>
      </div>
      <div className="col-span-3">
      <AceEditor
        mode="python"
        theme="github"
        value={code}
        onChange={setCode}
        name="editor"
        width="100%"
        height="100%"
        fontSize={14}
        setOptions={{ useWorker: false }}
      /></div>
    </motion.div>)}
      </div>
      

  );
}
