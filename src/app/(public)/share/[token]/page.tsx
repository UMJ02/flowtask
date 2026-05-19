import { SharedAnalyticsLanding } from '@/components/shared/shared-analytics-landing';
import { getStoredSharedAnalyticsPayload } from '@/lib/queries/shared-reports';

export const dynamic = 'force-dynamic';

export default async function SharedAnalyticsTokenPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: { print?: string };
}) {
  const payload = await getStoredSharedAnalyticsPayload(params.token);
  return <SharedAnalyticsLanding token={params.token} payload={payload} autoPrint={searchParams?.print === '1'} />;
}
