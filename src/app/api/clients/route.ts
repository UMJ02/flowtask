import { NextRequest, NextResponse } from "next/server";
import { getClients } from "@/lib/queries/clients";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = await getClients(searchParams.get("q") ?? undefined);
  return NextResponse.json({ data });
}
