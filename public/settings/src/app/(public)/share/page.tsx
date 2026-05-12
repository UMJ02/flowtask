import { SharedAnalyticsLanding } from '@/components/shared/shared-analytics-landing';

export const dynamic = 'force-dynamic';

export default function SharedAnalyticsQueryPage({
  searchParams,
}: {
  searchParams?: { data?: string; print?: string };
}) {
  return <SharedAnalyticsLanding token={searchParams?.data ?? ''} autoPrint={searchParams?.print === '1'} />;
}
