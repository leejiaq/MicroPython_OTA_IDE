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

    // Compile to .mpy
    await execPromise(`mpy-cross \"${srcPath}\"`);

    return new NextResponse(`Uploaded and compiled for ${id}!`, { status: 200 });
  } catch (err: any) {
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}
