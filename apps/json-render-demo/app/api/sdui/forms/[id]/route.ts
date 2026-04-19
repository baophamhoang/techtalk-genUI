import { NextResponse } from "next/server";
import { STATIC_SCHEMAS } from "../../../../../src/schemas/static";

const CACHE: Record<string, { schema: unknown; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const schema = STATIC_SCHEMAS[id];
  if (!schema) {
    return NextResponse.json({ error: "Schema not found" }, { status: 404 });
  }

  const now = Date.now();
  const cached = CACHE[id];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ schema: cached.schema, cached: true, latencyMs: 5 });
  }

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200));

  CACHE[id] = { schema, timestamp: now };
  return NextResponse.json({ schema, cached: false, latencyMs: 300 });
}