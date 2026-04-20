import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: { dataset: string } }) {
  try {
    const filePath = path.join(process.cwd(), "fixtures", `${params.dataset}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: `Mock dataset ${params.dataset} not found` }, { status: 404 });
  }
}