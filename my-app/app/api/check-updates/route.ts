import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  if (!deviceId) return new NextResponse("Missing deviceId", { status: 400 });

  const folder = path.join(process.cwd(), "scripts", deviceId);
  const filePath = path.join(folder, "main.mpy");
  if (!fs.existsSync(filePath)) return new NextResponse("none", { status: 200 });

  return new NextResponse("new", { status: 200 });
}
