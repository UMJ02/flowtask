# FlowTask v7.6.4 hooks fix full

- Fixed React error #310 in `src/components/dashboard/interactive-dashboard-board.tsx`.
- Moved `useMemo` hooks before the early `if (!hydrated) return ...` branch so hook order stays stable across renders.
- Built from the user-provided zip base, excluding local artifacts and secrets for safer handoff.
