# Product exhibition redesign

## Content and evidence audit

All public project records, independent work, visual work, the healthcare study, contact data and resume remain managed through the existing Supabase tables. The homepage now presents featured work through an interactive index. Supporting projects and the healthcare research note remain in the archive. Hidden records are never replaced by hardcoded public projects.

The bundled enterprise screenshot is an anonymized module launcher. Its five module fragments are viewport crops of the original file, not recreated product screens. The construction, healthcare and school SVGs are retained and explicitly identified as reconstructions. Original source images remain accessible through the inspection dialog and the case-study evidence section.

The two additional WebP files are captures of public prototype landing screens taken on 28 September 2026:

- `real-wealth-live.webp`: https://real-wealth-intelligence.vercel.app/ — the product labels this a client demo with prepared scenarios and no live data. This qualification is retained in the portfolio caption.
- `hi-quote-live.webp`: https://hi-quote.vercel.app/ — the prototype currently uses the BuildWise name. The caption includes both names.

No results, metrics, clients, dates or production states were inferred from these prototype screens. Image fallback selection uses the existing project URL; an admin-uploaded image takes precedence.

## Design direction

An editorial project exhibition: paper, dark green ink, a restrained citron accent; different muted environments for interfaces, construction workflows and system maps. Typography carries the identity. Large artifacts replace repeated descriptive project cards.

Four interaction patterns: project selection changes the exhibit; “Behind the product” reveals the delivery sequence; case-study workflow steps focus one stage at a time; original artifacts open in a keyboard-accessible inspection dialog with zoom. Native disclosures retain detailed experiment and archive content. There are no autoplay effects or scroll-jacking.

References reviewed: SiteBuilderReport PM portfolios and Best Websites 2026; Webflow Product Management showcase; Omolola Odunowo’s portfolio article; HelloPM’s portfolio guide; Figma’s web design trends; Site of Sites. These informed hierarchy and presentation, not copied components.

## Content management

Existing title, summary, order, featured/visibility, image path, category, problem, contribution, workflow and outcome controls remain in place. The existing `case_study` JSON also accepts these optional fields, without a migration:

- `presentation`: workspace, flow, map or image; empty uses the project default.
- `cover_title`, `cover_summary`: concise homepage copy; empty fields use the project title/summary.
- `hero_image_path`: a separate hero asset; otherwise the main evidence is used.
- `role_label`, `timeline`, `live_url`: only publish confirmed information.
- `gallery`: ordered `{ image_path, caption }` entries following the main evidence asset. The editor supports adding, editing, moving and removing entries before saving.

Existing case-study context, decisions, product workflow, evidence notes, shipped/advanced items, learning and stage remain editable. Auth, admin role checks, authenticator MFA, policies and deployment configuration are unchanged.

## Verification

TypeScript, targeted ESLint, production build and whitespace checks pass. Visual and runtime QA is performed on Vercel previews before promotion. Responsive QA uses the actual application in narrow browser frames; this validates responsive CSS and interactions, not physical device hardware or mobile browser performance.
