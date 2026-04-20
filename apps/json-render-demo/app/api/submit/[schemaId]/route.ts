import { NextResponse } from "next/server";
import { buildPayloadValidator } from "@techtalk/shared";
import { STATIC_SCHEMAS } from "../../../../src/schemas/static";

// This is essentially mimicking the backend handler for payload submissions.
export async function POST(req: Request, { params }: { params: { schemaId: string } }) {
  try {
    const { schemaId } = params;
    const payload = await req.json();

    // 1. Resolve Schema 
    // In production, we would query the database for SDUI, or load from static bundles, or read from session cache for GenUI.
    // For Demo 1 purposes, if it matches a static schema ID, we use it. We'll also allow the client to pass the schema in the payload for GenUI validation ease (or we could assume the UI sends the full schema if not found statically).
    
    let schema = Object.values(STATIC_SCHEMAS).find(s => s.id === schemaId) || payload._fullSchema;

    if (!schema) {
      return NextResponse.json({ error: "Schema not found." }, { status: 404 });
    }

    // Prepare payload by stripping internal _fullSchema
    const actualPayload = { ...payload };
    delete actualPayload._fullSchema;

    // 2. Dynamically build Zod validator and run strictly
    const validator = buildPayloadValidator(schema);
    const result = validator.safeParse(actualPayload);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        data: result.data,
        message: "Payload validated successfully against dynamic schema.",
      });
    } else {
      return NextResponse.json({
        ok: false,
        issues: result.error.issues,
        message: "Validation failed.",
      }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
