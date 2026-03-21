type DigestItem = {
  title: string;
  body?: string | null;
  created_at: string;
  entity_type?: string | null;
};

function section(items: DigestItem[]) {
  if (!items.length) return '<li>Sin movimientos recientes.</li>';
  return items
    .slice(0, 10)
    .map((item) => `<li><strong>${item.title}</strong>${item.body ? ` — ${item.body}` : ''} <span style="color:#64748b;">(${new Date(item.created_at).toLocaleString('es-CR')})</span></li>`)
    .join('');
}

export function buildDailyDigestEmail(params: {
  userName?: string | null;
  items: DigestItem[];
  digestDate: string;
}) {
  const greeting = params.userName?.trim() ? `Hola ${params.userName},` : 'Hola,';
  const title = `Resumen diario FlowTask · ${params.digestDate}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:680px;margin:0 auto;">
      <h1 style="font-size:22px;margin-bottom:8px;">${title}</h1>
      <p>${greeting}</p>
      <p>Aquí tienes el resumen diario con los cambios más relevantes registrados en FlowTask.</p>
      <ul>${section(params.items)}</ul>
      <p style="margin-top:20px;color:#475569;">Este resumen se generó automáticamente según tus preferencias de notificación.</p>
    </div>
  `;
  const text = `${title}

${greeting}

Aquí tienes el resumen diario con los cambios más relevantes registrados en FlowTask.

${params.items.slice(0,10).map((item)=>`- ${item.title}${item.body ? ` — ${item.body}` : ''} (${new Date(item.created_at).toLocaleString('es-CR')})`).join('
') || '- Sin movimientos recientes.'}`;
  return { title, html, text };
}
