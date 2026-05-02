import { NextResponse } from 'next/server';
import { createOnboardingDemoData } from '@/lib/actions/onboarding-demo-data';

export async function POST() {
  try {
    const result = await createOnboardingDemoData();

    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (error) {
    console.error('[onboarding-demo-data] Unexpected error', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'No fue posible cargar el ejemplo seguro en este momento. Intentá de nuevo o creá tu primera tarea manualmente.',
      },
      { status: 500 },
    );
  }
}
