# WeLovePDF UI/UX Rules

## Design Intent
Build a clean, trustworthy, fast PDF utility experience. The interface should feel practical, professional, and easy for repeated use.

## Inspiration Policy
We can study websites for layout, interaction patterns, information hierarchy, spacing, and conversion flow. We should not copy exact branding, logos, illustrations, text, proprietary icons, or pixel-perfect layouts.

## Public Tool Pages
- First screen must show the actual tool action, not a marketing-only hero.
- Upload area must be obvious, central, and confidence-building.
- Tool pages should have clear states: empty, dragging, uploading, processing, completed, failed.
- Keep support text short and useful.
- Mobile experience matters as much as desktop.

## Dashboard
- Dashboard should be operational, not decorative.
- Prefer dense but readable layouts.
- Use quick actions, recent jobs, usage limits, and saved workflows.
- Avoid oversized marketing heroes inside dashboard.
- No cards inside cards.
- Keep repeated tool cards consistent.

## Tool Grid
- Group tools by user intent, not technical category only.
- Use consistent icon sizes, card heights, and labels.
- Cards should scan quickly: icon, tool name, one short benefit line.
- Important tools can be visually prioritized, but the grid must remain calm.

## Visual System
- Use only 4 colors per theme. Do not introduce extra UI colors outside the active theme palette.
- Support both themes from the beginning:
  - White theme: app background, surface, text, accent.
  - Light theme: app background, surface, text, accent.
- State colors must be expressed through the same 4 theme colors using opacity, borders, weight, and spacing.
- Avoid becoming a one-color clone of any reference product.
- Accent color should guide attention, not dominate every surface.
- Use 8px or smaller radius unless a component truly needs more.
- Use stable dimensions for tool cards, upload zones, buttons, and status panels.
- Typography should be crisp and readable. Do not scale font sizes directly with viewport width.
- Spacing should feel clean and real-app ready on mobile and desktop.
- Use restrained shadows and borders. Prefer clarity over decoration.

## Maintainability
- Apply DRY to components, spacing, theme tokens, and repeated UI patterns.
- Do not create monolithic design files.
- Maximum preferred file size: 300 lines per file.
- Design tokens should make colors, spacing, typography, and radius easy to change without breaking screens.

## Ultra Disciplined CSS Tokenization
- Use 3-4 clear styling layers:
  1. Primitive tokens: the only raw color values, base spacing, radius, font scale.
  2. Semantic tokens: background, surface, text, accent, border, muted text derived from primitives.
  3. Component tokens: card padding, button height, nav height, upload-zone sizing.
  4. Page composition: grids, sections, and responsive layout only.
- Raw colors are allowed only in primitive theme tokens.
- Components must consume semantic or component tokens, not hard-coded values.
- Theme changes must happen by swapping token values, not by rewriting component CSS.
- Keep CSS grouped by layer and easy to scan.

## UX Details
- Every destructive action needs confirmation.
- File limits should be visible before upload.
- Errors should explain the fix, not just say failed.
- Completed jobs should offer download, delete, run another tool, and start over.
- Show privacy/auto-delete messaging near upload and download moments.

## Accessibility
- All controls must be keyboard usable.
- Buttons need clear accessible labels.
- Color cannot be the only state indicator.
- Text must not overlap or overflow on mobile or desktop.

## Design QA
- Check desktop and mobile before shipping major UI changes.
- Verify text fits inside cards/buttons.
- Verify empty, loading, error, and success states.
- Verify upload/drag/drop interactions are understandable.
