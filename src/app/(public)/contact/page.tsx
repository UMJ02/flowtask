import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container-page max-w-2xl">
        <div className="rounded-[28px] bg-white p-8 shadow-soft text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Contacto</h1>
          <p className="mt-3 text-slate-600">Escríbenos directo por WhatsApp Costa Rica para soporte o consultas.</p>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
            href="https://wa.me/50688451223"
            target="_blank"
          >
            Abrir WhatsApp
          </Link>
        </div>
      </div>
    </main>
  );
}
