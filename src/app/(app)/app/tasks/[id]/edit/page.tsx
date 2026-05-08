export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default async function TaskEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(Object.entries(search).flatMap(([_, value]) => (typeof value === 'string' && value ? [[_, value]] : [])));
  queryString.set('mode', 'edit');
  redirect(`/app/tasks/${id}?${queryString.toString()}`);
}
