import { NextResponse } from "next/server";
import * as sales from "../../../fixtures/sales.json";
import * as orders from "../../../fixtures/orders.json";
import * as users from "../../../fixtures/users.json";

const DATASETS: Record<string, unknown> = {
  sales,
  orders,
  users,
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ dataset: string }> }
) {
  const { dataset } = await params;
  const data = DATASETS[dataset];
  if (!data) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}