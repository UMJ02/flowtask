import { NextResponse } from "next/server";
import { getProjects } from "@/lib/queries/projects";

function toCsvValue(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export async function GET() {
  const rows = await getProjects({});
  const csvRows = [
    ["id", "titulo", "cliente", "estado", "deadline", "tipo"],
    ...rows.map((item: any) => [
      item.id,
      item.title,
      item.client_name || "",
      item.status,
      item.due_date || "",
      item.is_collaborative ? "colaborativo" : "personal",
    ]),
  ];
  const csv = csvRows.map((row) => row.map(toCsvValue).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="proyectos-flowtask.csv"',
    },
  });
}
