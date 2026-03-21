import { NextRequest, NextResponse } from "next/server";
import { getTasks } from "@/lib/queries/tasks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = await getTasks({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    due: searchParams.get("due") ?? undefined,
  });
  return NextResponse.json({ data });
}
