import type { AppRoute } from '@/lib/navigation/routes';

export type MemoryEntityType = 'task' | 'project';

export type MemoryEntity = {
  id: string;
  type: MemoryEntityType;
  title: string;
  subtitle?: string | null;
  href: AppRoute;
  updatedAt: string;
};

type WorkspaceMemory = {
  favorites: MemoryEntity[];
  pinned: MemoryEntity[];
  recent: MemoryEntity[];
};

const STORAGE_KEY = 'flowtask.workspace.memory.v1';
const MAX_FAVORITES = 12;
const MAX_PINNED = 8;
const MAX_RECENT = 10;

function getDefaultMemory(): WorkspaceMemory {
  return { favorites: [], pinned: [], recent: [] };
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function readWorkspaceMemory(): WorkspaceMemory {
  if (!isBrowser()) return getDefaultMemory();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultMemory();
    const parsed = JSON.parse(raw) as Partial<WorkspaceMemory>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return getDefaultMemory();
  }
}

function writeWorkspaceMemory(memory: WorkspaceMemory) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  window.dispatchEvent(new CustomEvent('flowtask-memory-updated'));
}

function uniqueEntities(items: MemoryEntity[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function upsert(items: MemoryEntity[], entity: MemoryEntity, maxItems: number) {
  return uniqueEntities([entity, ...items.filter((item) => !(item.id === entity.id && item.type === entity.type))]).slice(0, maxItems);
}

export function toggleFavorite(entity: MemoryEntity) {
  const memory = readWorkspaceMemory();
  const exists = memory.favorites.some((item) => item.id === entity.id && item.type === entity.type);
  const favorites = exists
    ? memory.favorites.filter((item) => !(item.id === entity.id && item.type === entity.type))
    : upsert(memory.favorites, entity, MAX_FAVORITES);
  writeWorkspaceMemory({ ...memory, favorites });
}

export function togglePinned(entity: MemoryEntity) {
  const memory = readWorkspaceMemory();
  const exists = memory.pinned.some((item) => item.id === entity.id && item.type === entity.type);
  const pinned = exists
    ? memory.pinned.filter((item) => !(item.id === entity.id && item.type === entity.type))
    : upsert(memory.pinned, entity, MAX_PINNED);
  writeWorkspaceMemory({ ...memory, pinned });
}

export function addRecent(entity: MemoryEntity) {
  const memory = readWorkspaceMemory();
  const recent = upsert(memory.recent, entity, MAX_RECENT);
  writeWorkspaceMemory({ ...memory, recent });
}

export function isFavoriteEntity(entity: Pick<MemoryEntity, 'id' | 'type'>) {
  return readWorkspaceMemory().favorites.some((item) => item.id === entity.id && item.type === entity.type);
}

export function isPinnedEntity(entity: Pick<MemoryEntity, 'id' | 'type'>) {
  return readWorkspaceMemory().pinned.some((item) => item.id === entity.id && item.type === entity.type);
}
