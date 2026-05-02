import { NextResponse } from 'next/server';
import { createOnboardingDemoData } from '@/lib/actions/onboarding-demo-data';

export async function POST() {
  const result = await createOnboardingDemoData();

  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
