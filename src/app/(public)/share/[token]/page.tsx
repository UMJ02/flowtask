import { SharedAnalyticsLanding } from '@/components/shared/shared-analytics-landing';

export const dynamic = 'force-dynamic';

export default function SharedAnalyticsPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: { print?: string };
}) {
  return <SharedAnalyticsLanding token={params.token} autoPrint={searchParams?.print === '1'} />;
}
