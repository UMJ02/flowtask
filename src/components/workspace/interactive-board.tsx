"use client";

const columns = [
  {
    title: "Por hacer",
    cards: [
      { title: "Definir flujo de clientes", tag: "Hoy" },
      { title: "Revisar prioridades", tag: "Alta" }
    ]
  },
  {
    title: "En curso",
    cards: [
      { title: "Pizarra interactiva", tag: "UI" },
      { title: "Acciones rápidas", tag: "Core" }
    ]
  },
  {
    title: "En revisión",
    cards: [
      { title: "Textos más humanos", tag: "UX" }
    ]
  },
  {
    title: "Listo",
    cards: [
      { title: "Nueva navegación", tag: "OK" }
    ]
  }
];

export function InteractiveBoard() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">Pizarra</h2>
        <p className="text-sm text-muted-foreground">Mueve el trabajo y mantén el foco.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title} className="rounded-2xl border bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">{column.title}</h3>
              <span className="text-xs text-muted-foreground">{column.cards.length}</span>
            </div>
            <div className="space-y-3">
              {column.cards.map((card) => (
                <article key={card.title} className="rounded-xl border p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug">{card.title}</p>
                    <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                      {card.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Click derecho o menú rápido para actuar.
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
