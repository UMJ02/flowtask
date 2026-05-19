import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import type { SharedAnalyticsPayload } from '@/lib/share/analytics-share';

export const dynamic = 'force-dynamic';

type ShareRequestBody = {
  payload?: SharedAnalyticsPayload;
};

function generateReportToken() {
  return `rpt_${randomBytes(6).toString('base64url')}`;
}

function isValidSharedAnalyticsPayload(value: unknown): value is SharedAnalyticsPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<SharedAnalyticsPayload>;
  return typeof payload.workspaceName === 'string'
    && Boolean(payload.workspaceName.trim())
    && typeof payload.generatedAtLabel === 'string'
    && Boolean(payload.shareDigest)
    && Boolean(payload.reportModules)
    && Array.isArray(payload.recommendations);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: ShareRequestBody;
  try {
    body = await request.json() as ShareRequestBody;
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  if (!isValidSharedAnalyticsPayload(body.payload)) {
    return NextResponse.json({ error: 'Reporte inválido' }, { status: 400 });
  }

  const token = generateReportToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const { error } = await supabase.from('shared_reports').insert({
    token,
    owner_id: user.id,
    workspace_name: body.payload.workspaceName,
    payload: body.payload,
    expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json({ error: 'No se pudo crear el enlace compartido' }, { status: 500 });
  }

  const url = new URL(`/share/${token}`, request.url);
  return NextResponse.json({ token, path: `/share/${token}`, url: url.toString(), expiresAt });
}
