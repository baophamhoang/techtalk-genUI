import { NextResponse } from "next/server";
import { buildSignalBundle } from "../../lib/signals/collector";
import { composeUI } from "../../lib/compose/composer";

export async function POST(req: Request) {
  const { personaId, scenario } = await req.json();

  if (!personaId || !scenario) {
    return NextResponse.json({ error: "Missing personaId or scenario" }, { status: 400 });
  }

  const bundle = buildSignalBundle(personaId, scenario);
  const result = await composeUI(bundle);

  return NextResponse.json({
    bundle,
    ...result,
  });
}