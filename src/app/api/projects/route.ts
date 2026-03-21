import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/queries/projects";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = await getProjects({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    mode: searchParams.get("mode") ?? undefined,
    client: searchParams.get("client") ?? undefined,
  });
  return NextResponse.json({ data });
}
