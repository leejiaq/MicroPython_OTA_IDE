import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  if (!deviceId) return new NextResponse("Missing deviceId", { status: 400 });

  const filePath = path.join(process.cwd(), "scripts", deviceId, "main.mpy");
  if (!fs.existsSync(filePath)) return new NextResponse("Not found", { status: 404 });

  const data = fs.readFileSync(filePath);
  return new NextResponse(data, {
    status: 200,
    headers: { "Content-Type": "application/octet-stream" },
  });
}
