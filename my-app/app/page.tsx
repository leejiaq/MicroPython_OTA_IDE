"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
const AceEditor = dynamic(async () => await import("react-ace"), { ssr: false });
import 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "@/components/componentMap"
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/16/solid";
import { time } from "console";
import TimestampModal from "@/components/VersionModal";
import { load } from "ace-builds/src-noconflict/ext-emmet";

interface Projects {
  id: number;
  name: string;
  device_name: string;
  last_modified: string;
  timestamps: string[];
}

export default function Home() {
  const [espId, setEspId] = useState("");
  const [code, setCode] = useState("# Write your code here...");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(1);
  const [drop, setDrop] = useState(0);
  const [create, setCreate] = useState(true);
  const [project, setProject] = useState("");
  const [id, setId] = useState(-1)
  const [projectData, setProjectData] = useState<Projects[]>([]);
  const [showModal, setShowModal] = useState(false);
  let latestSavedCode = "# Write your code here...";

  useEffect(() => {
        if (typeof window !== 'undefined') {
          const currentProj = localStorage.getItem('projects');
          if (currentProj) {
            try {
            const parsedData = JSON.parse(currentProj);
            setEspId(parsedData.device_name);
            setProject(parsedData.project_name);
            setCode(parsedData.code);
            } catch (e) {
              console.error("Error parsing project data:", e);
            }
          }
        }
      }, []);

    useEffect(() => {
      const intervalId = setInterval(() => {
        saveVersion(true);
        console.log("Auto-saved code.");
      }, 60 * 1000); // 60 seconds

      return () => clearInterval(intervalId);
    }, []); 


  const dropdown = () => {
    if (drop == 0) {
      setDrop(1);
    } else {
      setDrop(0);
    }
  }

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

  const saveVersion = (auto:boolean) => {
    if (code != latestSavedCode) {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`${id}_${timestamp}`, code);
    latestSavedCode = code;
    const stored = localStorage.getItem("projectData");
    if (!stored) return;
    const data = JSON.parse(stored);
    data.projects[id].timestamps.unshift(timestamp);
    data.projects[id].last_modified = timestamp;
    if (data.projects[id].timestamps.length > 10) {
    const removed = data.projects[id].timestamps.pop();
    if (removed) localStorage.removeItem(`${id}_${removed}`);
  } 

  localStorage.setItem("projectData", JSON.stringify(data));
    if (!auto) {
        alert("Saved version locally.");
    }
    } else {
      if (!auto) {
    alert("No changes to save.");
      }
    }
  };


// load project
  useEffect(() => {
    const stored = localStorage.getItem("projectData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProjectData(parsed.projects || []);
    }
  }, []);


  const createProject = () => {
    if (create) {
      const stored = localStorage.getItem("projectData") || JSON.stringify({projects: []});
      if (!stored) return;
      const data = JSON.parse(stored);
      let projectids= data.projects.length;
        data.projects.push({
          id: projectids,
          name: project,
          device_name: espId,
          last_modified: new Date().toISOString(),
          timestamps: []
      });

      setId(projectids);
      localStorage.setItem("projectData", JSON.stringify(data));
      alert(`Project created!`);
    } else {
      const stored = localStorage.getItem("projectData");
      if (!stored) return;
      const data = JSON.parse(stored);
      data.projects[id].name = project;
      data.projects[id].device_name = espId;
      localStorage.setItem("projectData", JSON.stringify(data));
      alert("Project settings updated!");
    }
  }

// load versions

  function loadVersion(ts: string) {
    const code = localStorage.getItem(`${id}_${ts}`);
    setCode(code || "");
    console.log("Loaded:", ts, code);
    setShowModal(false);
  }

const loadTimestamp = () => {
  const stored = localStorage.getItem("projectData") || JSON.stringify({projects: []});
  if (!stored) return;
  const data = JSON.parse(stored);
  return data.projects[id].timestamps;
}

const deleteProject = () => {
  if (!create){
  const stored = localStorage.getItem("projectData");
  if (!stored) return;
  const data = JSON.parse(stored);
  data.projects[id].timestamps.forEach((ts: string) => {
    localStorage.removeItem(`${id}_${ts}`);
  }
  );
  data.projects.splice(id, 1);
  localStorage.setItem("projectData", JSON.stringify(data));
  alert("Project deleted!");
  setStep(1);} else {
    setStep(1)
  }
}


  return (
    <div className="font-sans relative overflow-hidden w-full h-screen bg-[#0C2B4E]">

      {/* Onboarding */}
      { step === 1 && 
      (<div className="bg-[#0C2B4E] w-full h-full flex items-center justify-center gap-24 p-12 absolute inset-0">
        <div className="rounded-full h-[50vw] w-[50vw] bg-[#747474] absolute -top-84 left-10 blur-[200px] z-0"/>
        <div className="rounded-full h-[50vw] w-[50vw] bg-[#1D546C] absolute -bottom-10 -right-20 blur-[200px] z-0"/>

        <div className="flex items-center justify-center gap-10 bg-slate-300/20 h-full w-full rounded-4xl flex-col z-10 shadow-2xl p-10">
        <h1 className="font-semibold text-5xl text-center">ESP32 Projects</h1>
        
        <div className="h-96 w-full max-w-3xl rounded-4xl shadow-xl p-4 overflow-y-scroll flex flex-col" id="project-list">
        {projectData.map((projects, index) => (<div key={index}>
          <div tabIndex={0} className="w-full py-6 px-4 flex rounded-2xl justify-between bg-slate-50/80 backdrop-blur-2xl text-black focus:outline-2 focus:outline-sky-500" onClick={()=>{setStep(3);setId(index);setEspId(projects.device_name);setProject(projects.name)}}><div><p className="text-xl font-medium">{projects.name}</p>Delete</div> <div className="flex flex-col text-sm gap-y-2 text-right opacity-60">Device name: {projects.device_name}<span>Last modified: {new Date(projects.last_modified).toLocaleString()}</span></div></div>
          <hr className="w-full border-slate-50/30 my-1"></hr></div>
        ))} {projectData.length ==0 && (<div className="w-full h-full flex items-center justify-center text-slate-50/50">No projects found. Create a new project to get started!</div>)}
        
        </div>
        <div className="flex items-center gap-4">
          <button onClick={()=>{setCreate(true); setStep(2)}} className="rounded-full h-16 px-12 bg-[#D9D9D9] text-black font-semibold text-xl flex items-center justify-center cursor-pointer">+ New Project
          </button>
          {/*<button onClick={()=>{saveCurrentPage(2)}} className="rounded-full h-16 w-16 bg-[#D9D9D9]/50 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          </button>*/}
        </div>
        </div>
      </div>)}


      {/* Onboarding 2 */}
      { step === 2 && (<div className="bg-[#0C2B4E] w-full h-full flex items-center justify-center gap-24 p-12 absolute inset-0">
        <div className="rounded-full h-[50vw] w-[50vw] bg-[#747474] absolute -top-84 left-10 blur-[200px] z-0"/>
        <div className="rounded-full h-[50vw] w-[50vw] bg-[#1D546C] absolute -bottom-10 -right-20 blur-[200px] z-0"/>
        <div className="flex items-center justify-center gap-12 bg-slate-300/20 h-full w-full rounded-4xl flex-col z-10 shadow-2xl">
        <h2 className="font-semibold text-6xl text-center">{create?"New Project Setup":"Project Setting"}</h2>
        <form action={()=>{setStep(3);createProject()}} className="flex flex-col items-center">
          <label htmlFor="proj-id">Project Name</label>
        <input id="proj-id" type="text" placeholder="Project Name (e.g., LED)" className="outline-none border-b border-slate-700 focus:border-white p-2 w-56 duration-200" value={project}
        onChange={(e) => setProject(e.target.value)} required />
        <label htmlFor="device-id" className="mt-12">Device name</label>
        <input id="device-id" type="text" placeholder="ESP32 ID (e.g., esp32-001)" className="outline-none border-b border-slate-700 focus:border-white p-2 w-56 duration-200" value={espId}
        onChange={(e) => setEspId(e.target.value)} required />
        <button type="submit" className="mt-12 rounded-full h-16 px-8 gap-4 bg-[#D9D9D9] text-black flex items-center justify-center cursor-pointer">{create?"Create New Project":"Save Settings"}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          </button>
          <a href={create? "#": "/"} className="mt-6 rounded-full h-16 px-8 gap-4 bg-[#D9D9D9] text-black flex items-center justify-center cursor-pointer" onClick={deleteProject}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${create? "hidden": ""}`}>
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>{create?"Cancel":"Delete Project"}
          </a>
          </form></div>
      </div>)}


      {/* IDE */}
      { step === 3 && (<div className="p-6 grid grid-cols-5 h-full gap-4">
      <div className="col-span-1 flex flex-col">
      <h2 className="text-2xl mb-4">Editing: <span className="font-semibold">{project}</span></h2>
      <p>Device name: <span className="font-semibold">{espId}</span></p>
      <a onClick={()=>{setStep(2);setCreate(false);}} className="underline cursor-pointer">Modify or Delete Project</a>
      <a href="/" onClick={()=>{setStep(1)}} className="underline mb-4 cursor-pointer">Select Project</a>
      <div className="flex flex-col gap-2 items-start">
        <div className="relative">
          <button className="pl-4 pr-2.5 w-52 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer flex justify-between border-b" onClick={dropdown}>Snippets <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
          </button>
          <div className={`dropdown-wrapper ${drop? "block": "hidden"}`}>
            <div className="flex flex-col">
              <button onClick={() => insertSnippet("servo")} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Servo Snippet</button>
              <button onClick={() => insertSnippet("ultrasonic")} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Ultrasonic Snippet</button>
              <button className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer" onClick={() => setStep(1)}>1</button>
              <button className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer" onClick={() => setStep(2)}>2</button>
            </div>
          </div>
        </div>
        <button onClick={uploadCode} className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer">Upload to ESP32</button>
        <div className="mt-3 text-sm text-gray-300">{status}  
            </div>
        <button onClick={()=>{saveVersion(false)}} className={`px-4 py-2 ${latestSavedCode == code ? "bg-[#7f7f7f] cursor-not-allowed": "bg-[#F4F4F4]"} text-[#1A3D64] cursor-pointer`}>Save</button>
              <button
        className="px-4 py-2 bg-[#F4F4F4] text-[#1A3D64] cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Saved code
      </button>
        <div className="p-4">


      {showModal && (
        <TimestampModal
          timestamps={loadTimestamp()}
          onClose={() => setShowModal(false)}
          onSelect={loadVersion}
        />
      )}
    </div>
      </div>
      </div>
      <div className="col-span-2 flex flex-col gap-4">
        <h2 className="text-xl">Your Code:</h2>
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
      <div className="col-span-2 flex flex-col gap-4">
        <h2 className="text-xl">Reference Code:</h2>
        <AceEditor
        mode="python"
        theme="github"
        name="editor"
        width="100%"
        height="100%"
        fontSize={14}
        setOptions={{ useWorker: false }}
      /></div>
    </div>)}
      </div>
      

  );
}
