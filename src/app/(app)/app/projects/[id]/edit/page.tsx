export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default async function ProjectEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const query = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  );
  query.set('mode', 'edit');
  redirect(`/app/projects/${id}?${query.toString()}`);
}
