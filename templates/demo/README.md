# Reusable HTML Demo Skeleton

This directory contains deterministic HTML demo templates for generated design guides.

## Files

- `index.html` defines the page shell, sidebar, and main content area.
- `section.html` defines one generated guide section.
- `example-card.html` defines one component example wrapper.
- `demo.schema.json` defines the data contract for generated demo data.

## Rules

- Use the demo workspace's generated CSS (`tmp/pif/demo/dist/demo.css`), not the standalone export CSS.
- Generate examples from structured data and typed props, not ad hoc prose.
- Backfill standard look-and-feel coverage during render: applied foundations, text and list elements, forms, states, navigation chrome, tables, feedback, media, overlays, and full-page product screens.
- Keep the demo static and component-framework-agnostic.
- Target the latest stable Tailwind release only.
