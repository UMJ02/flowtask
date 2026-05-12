'use client';

import { useEffect } from 'react';
import { addRecent, type MemoryEntity } from '@/lib/local/workspace-memory';

export function EntityRecentTracker({ entity }: { entity: MemoryEntity }) {
  useEffect(() => {
    addRecent(entity);
  }, [entity]);

  return null;
}
