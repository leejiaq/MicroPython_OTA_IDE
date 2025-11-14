import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    let { id, code } = await req.json();
    const folder = path.join(process.cwd(), "scripts", id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const boot = "\nimport network, time, env\nimport ubinascii\nimport requests as urequests\nimport os, machine\nimport datetime\ndef get_formatted_mac():\n    sta_if = network.WLAN(network.STA_IF)\n    sta_if.active(True)\n    wlan_mac_bytes = sta_if.config('mac')\n    mac_hex = ubinascii.hexlify(wlan_mac_bytes).decode()\n    return mac_hex[-6:]\nfrom ssd1306 import SSD1306_I2C\nSDA_PIN = 8\nSCL_PIN = 9\nOLED_WIDTH = 128\nOLED_HEIGHT = 64\ntry:\n    i2c = machine.I2C(0, scl=machine.Pin(SCL_PIN), sda=machine.Pin(SDA_PIN))\n    oled = SSD1306_I2C(OLED_WIDTH, OLED_HEIGHT, i2c)\nexcept Exception as e:\n    print(f\"Error initializing I2C or OLED: {e}\")\ndef display_mac():\n    mac_addr = get_formatted_mac()\n    oled.text(mac_addr, 0, 16)\n    oled.text(\"chk\", 0, 0)\n    oled.show()\n# --- Main loop ---\nif 'oled' in locals():\n    display_mac()\nDEVICE_ID = get_formatted_mac()\nSERVER = env.SERVER\ndef get_version():\n    try:\n        with open(\"version.txt\") as f:\n            result = f.read()[1:-1].split(\", \")\n            if result == [\"\"]:\n                return [1,1,1,0,0,0]\n            return result\n    except:\n        return [1,1,1,0,0,0]\nprint(\"get_version\", get_version())\ndef save_version(v):\n    with open(\"version.txt\", \"w\") as f:\n        f.write(str(v))\ndef update():\n    print(\"trying to update\")\n    v = get_version()\n    while True:\n        try:\n            print(\"before request\")\n            print(f\"{SERVER}/api/check-updates?deviceId={DEVICE_ID}\")\n            res = urequests.get(f\"{SERVER}/api/check-updates?deviceId={DEVICE_ID}\")\n            print(\"request success\")\n            date_current = v\n            date_update = res.text.strip()\n            space = date_update.split(\" \")\n            dates = space[0].split(\"-\")\n            times = space[1].split(\":\")\n            print(dates)\n            print(times)\n            date_updateobj = datetime.datetime(int(dates[0]), int(dates[1]), int(dates[2]), int(times[0]), int(times[1]), int(times[2]))\n            print(date_updateobj)\n            date_currentobj = datetime.datetime(int(v[0]),int(v[1]),int(v[2]),int(v[3]),int(v[4]),int(v[5]))\n            print(date_currentobj)\n            if date_updateobj > date_currentobj:\n                print(\"New update found! Downloading...\")\n                oled.text(\"dw\", 0, 0)\n                oled.show\n                r2 = urequests.get(f\"{SERVER}/api/download?deviceId={DEVICE_ID}\")\n                with open(\"main.mpy\", \"wb\") as f:\n                    f.write(r2.content)\n                save_version([int(dates[0]), int(dates[1]), int(dates[2]), int(times[0]), int(times[1]), int(times[2])])\n                print(\"Update complete.\")\n                time.sleep(2)\n                machine.reset()\n            else:\n                print(\"No update.\")\n                oled.fill(0)\n                oled.text(get_formatted_mac(), 0, 16)\n                oled.text(\"-\",0,0)\n                oled.show()\n                break\n        except Exception as e:\n            print(\"Update error:\", e)\n            time.sleep(2)\n            oled.fill(0)\n            oled.text(get_formatted_mac(), 0, 16)\n            oled.text(\"err\",0,0)\n            oled.show()\nupdate()\n__import__('main')"
    code = code + boot;
    const srcPath = path.join(folder, "main.py");
    fs.writeFileSync(srcPath, code);

    function formatDateTime(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const now = new Date();
    const formattedDate = formatDateTime(now);
    
    let obj:any = {};
    obj["date"] = formattedDate;
    const dateJson = JSON.stringify(obj);

    const datePath = path.join(folder, "date.json");
    fs.writeFileSync(datePath, dateJson);
    console.log(dateJson);
    // Compile to .mpy
    await execPromise(`mpy-cross \"${srcPath}\"`);

    return new NextResponse(`Uploaded and compiled for ${id}!`, { status: 200 });
  } catch (err: any) {
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}
