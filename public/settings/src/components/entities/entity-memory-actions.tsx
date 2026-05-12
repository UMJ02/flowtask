'use client';

import { Pin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnames';
import { type MemoryEntity } from '@/lib/local/workspace-memory';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';

export function EntityMemoryActions({ entity, compact = false }: { entity: MemoryEntity; compact?: boolean }) {
  const { isFavorite, isPinned, toggleFavorite, togglePinned } = useWorkspaceMemory();
  const favorite = isFavorite(entity);
  const pinned = isPinned(entity);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(entity);
        }}
        className={cn('border-slate-200 px-3 py-2 text-xs', favorite && 'border-amber-200 bg-amber-50 text-amber-700')}
        aria-pressed={favorite}
        title={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Star className={cn('h-4 w-4', favorite && 'fill-current')} />
        {compact ? null : favorite ? 'Favorito' : 'Favorito'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePinned(entity);
        }}
        className={cn('border-slate-200 px-3 py-2 text-xs', pinned && 'border-sky-200 bg-sky-50 text-sky-700')}
        aria-pressed={pinned}
        title={pinned ? 'Quitar de fijados' : 'Fijar en dashboard'}
      >
        <Pin className={cn('h-4 w-4', pinned && 'fill-current')} />
        {compact ? null : pinned ? 'Fijado' : 'Fijar'}
      </Button>
    </div>
  );
}
