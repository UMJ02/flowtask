"use client";

import dynamic from "next/dynamic";

// v58.28.15 — Lazy load hidden Workspace Pro surfaces.
// These panels are not part of the initial user-visible view, so they should not
// inflate the first Workspace Pro client bundle until the user explicitly opens them.
const emptyLoader = () => null;

export const LazyWorkspaceQuickCreate = dynamic(
  () =>
    import("@/components/workspace-system/workspace-quick-create").then(
      (mod) => mod.WorkspaceQuickCreate,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceSavedViewsManager = dynamic(
  () =>
    import("@/components/workspace-system/workspace-saved-views-manager").then(
      (mod) => mod.WorkspaceSavedViewsManager,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceSpacesManager = dynamic(
  () =>
    import("@/components/workspace-system/workspace-spaces-manager").then(
      (mod) => mod.WorkspaceSpacesManager,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceCommandCenter = dynamic(
  () =>
    import("@/components/workspace-system/workspace-command-center").then(
      (mod) => mod.WorkspaceCommandCenter,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceSharePanel = dynamic(
  () =>
    import("@/components/workspace-system/workspace-share-panel").then(
      (mod) => mod.WorkspaceSharePanel,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceRecoveryPanel = dynamic(
  () =>
    import("@/components/workspace-system/workspace-recovery-panel").then(
      (mod) => mod.WorkspaceRecoveryPanel,
    ),
  { ssr: false, loading: emptyLoader },
);

export const LazyWorkspaceFilesUploadEntry = dynamic(
  () =>
    import("@/components/workspace-system/workspace-files-upload-entry").then(
      (mod) => mod.WorkspaceFilesUploadEntry,
    ),
  { ssr: false, loading: emptyLoader },
);
