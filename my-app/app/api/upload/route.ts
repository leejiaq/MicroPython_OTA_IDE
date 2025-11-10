import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { id, code } = await req.json();
    const folder = path.join(process.cwd(), "scripts", id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

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
