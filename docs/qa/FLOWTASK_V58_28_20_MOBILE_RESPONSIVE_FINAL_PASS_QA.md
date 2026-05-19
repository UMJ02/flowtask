# FlowTask v58.28.20 Mobile / Responsive QA

Validate these routes on desktop, tablet and mobile widths:

- /app/workspace?view=home
- /app/workspace?view=tasks
- /app/workspace?view=projects
- /app/workspace?view=board
- /app/workspace?view=timeline
- /app/workspace?view=table
- /app/workspace?view=canvas
- /app/workspace?view=files
- /app/workspace?view=reports

## Mobile checks

- Sidebar opens and closes correctly.
- Tabs scroll horizontally without clipping.
- Filters scroll horizontally without breaking layout.
- Board columns use horizontal scroll and do not collapse.
- Board action menu behaves like a bottom sheet.
- Quick Create sheet stays inside the viewport.
- Spaces and saved views sheets stay inside the viewport.
- Right inspector behaves like a bottom sheet.
- Inline task editor remains usable with horizontal controls.
- Forms use 16px input text to reduce mobile zoom.
- Empty states remain readable.
