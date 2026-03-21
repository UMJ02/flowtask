import { NextResponse } from "next/server";
import { getTasks } from "@/lib/queries/tasks";

function toCsvValue(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export async function GET() {
  const rows = await getTasks({});
  const csvRows = [
    ["id", "titulo", "cliente", "estado", "deadline", "departamento"],
    ...rows.map((item: any) => [
      item.id,
      item.title,
      item.client_name || "",
      item.status,
      item.due_date || "",
      Array.isArray(item.departments) ? item.departments[0]?.name || "" : item.departments?.name || "",
    ]),
  ];
  const csv = csvRows.map((row) => row.map(toCsvValue).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tareas-flowtask.csv"',
    },
  });
}
