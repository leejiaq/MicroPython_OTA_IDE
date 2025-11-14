# MicroPython OTA IDE (Next.js + ESP32 Wireless Code Deployment System)

MicroPython OTA IDE is a classroom-friendly coding environment that allows students to
write Python for ESP32 boards directly in the browser, save versioned snapshots,
and wirelessly deploy code to their MicroPython devices. Designed for iPad and
laptop use, the system removes the need for USB flashing and makes electronics
learning much easier.

---

## 🚀 Overview

MicroPython OTA IDE consists of **three parts**:

1. **Next.js Frontend**
   - Code editor (ACE Editor)
   - Project system stored in localStorage
   - Versioned timestamps (10 per project)
   - Upload code to server (POST `/api/upload`)
   - View/edit older versions through a modal

2. **Next.js Backend**
   - Receives Python code
   - Runs `mpy-cross` to compile `.py` → `.mpy`
   - Stores compiled `main.mpy` under a device ID
   - Serves ESP32 with the newest version when requested

3. [**ESP32 (MicroPython)**](https://github.com/leejiaq/MicroPython_OTA_Boot)
   - Runs `boot.py` at startup
   - Connects to WiFi
   - Pings `/firmware/<device_id>` every X seconds
   - Downloads new `main.mpy` if available
   - Saves it and executes it
   - Uses `.mpy` only (faster + smaller)

# MicroPython_OTA_IDE

A lightweight Next.js-based IDE for editing MicroPython projects and deploying them wirelessly (OTA) to ESP32 devices. Includes local project storage, timestamped version history (max 10 snapshots), and a simple API to push .mpy files to MicroPython_OTA_Boot devices.

## Features
- Browser IDE (ACE editor or Monaco)
- Project creation & localStorage persistence
- Version history using `{projectId}_{timestamp}`
- OTA upload endpoint to ESP32
- iPad-friendly UI (no animations, no layout shift)

## Development
```bash
npm install
npm run dev
```
or
```bash
pnpm install
pnpm dev
```

## Build
```bash
npm run build && npm run start
```
or
```bash
pnpm build && pnpm start
```

## API Endpoints

`POST /api/upload` → send `.mpy` file to device

`GET /api/status` → ping device

`POST /api/reboot` → reboot device

## Project 