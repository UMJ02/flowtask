'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addRecent,
  isFavoriteEntity,
  isPinnedEntity,
  readWorkspaceMemory,
  toggleFavorite,
  togglePinned,
  type MemoryEntity,
} from '@/lib/local/workspace-memory';

export function useWorkspaceMemory() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion((current) => current + 1);
    window.addEventListener('flowtask-memory-updated', onUpdate as EventListener);
    return () => window.removeEventListener('flowtask-memory-updated', onUpdate as EventListener);
  }, []);

  const memory = useMemo(() => readWorkspaceMemory(), [version]);

  return {
    ...memory,
    version,
    addRecent,
    toggleFavorite,
    togglePinned,
    isFavorite: (entity: Pick<MemoryEntity, 'id' | 'type'>) => isFavoriteEntity(entity),
    isPinned: (entity: Pick<MemoryEntity, 'id' | 'type'>) => isPinnedEntity(entity),
  };
}
