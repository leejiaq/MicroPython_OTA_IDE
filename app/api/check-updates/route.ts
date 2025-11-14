import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  if (!deviceId) return new NextResponse("Missing deviceId", { status: 400 });

  const folder = path.join(process.cwd(), "scripts", deviceId);
  const filePath = path.join(folder, "main.mpy");
  const datePath = path.join(folder, "date.json");


  if (!fs.existsSync(filePath)) return new NextResponse("01-01-0001 00:00:00", { status: 200 });
  const fileContent = await fs.readFileSync(datePath, "utf-8");
  const data = JSON.parse(fileContent);
  return new NextResponse(data.date, { status: 200 });
}
