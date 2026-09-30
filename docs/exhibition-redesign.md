# Product exhibition redesign

## Content and evidence audit

All public project records, independent work, visual work, the healthcare study, contact data and resume remain managed through the existing Supabase tables. The homepage now presents featured work through an interactive index. Supporting projects and the healthcare research note remain in the archive. Hidden records are never replaced by hardcoded public projects.

The bundled enterprise screenshot is an anonymized module launcher. Its five module fragments are viewport crops of the original file, not recreated product screens. The construction, healthcare and school SVGs are retained and explicitly identified as reconstructions. Original source images remain accessible through the inspection dialog and the case-study evidence section.

The two additional WebP files are captures of public prototype landing screens taken on 28 September 2026:

- `real-wealth-live.webp`: https://real-wealth-intelligence.vercel.app/ — the product labels this a client demo with prepared scenarios and no live data. This qualification is retained in the portfolio caption.
- `hi-quote-live.webp`: https://hi-quote.vercel.app/ — the prototype currently uses the BuildWise name. The caption includes both names.

No results, metrics, clients, dates or production states were inferred from these prototype screens. Image fallback selection uses the existing project URL; an admin-uploaded image takes precedence.

## Design direction

An editorial project exhibition: paper, dark green ink, a restrained citron accent; one neutral evidence surface for interfaces, construction workflows and system maps. Typography carries the identity. Large artifacts replace repeated descriptive project cards.

Four interaction patterns: project selection changes the exhibit; “Behind the product” reveals the delivery sequence; case-study workflow steps focus one stage at a time; original artifacts open in a keyboard-accessible inspection dialog with zoom. Native disclosures retain detailed experiment content; the supporting archive is four visible, consistent rows. There are no autoplay effects or scroll-jacking.

References reviewed: SiteBuilderReport PM portfolios and Best Websites 2026; Webflow Product Management showcase; Omolola Odunowo’s portfolio article; HelloPM’s portfolio guide; Figma’s web design trends; Site of Sites. These informed hierarchy and presentation, not copied components.

## Content management

Existing title, summary, order, featured/visibility, image path, category, problem, contribution, workflow and outcome controls remain in place. The existing `case_study` JSON also accepts these optional fields, without a migration:

- `presentation`: workspace, flow, map or image; empty uses the project default.
- `cover_title`, `cover_summary`: concise homepage copy; empty fields use the project title/summary.
- `cover_owned`, `cover_decision`: homepage proof beside the selected exhibit; empty fields use the existing contribution and first important decision.
- `hero_image_path`: a separate hero asset; otherwise the main evidence is used.
- `role_label`, `timeline`, `live_url`: only publish confirmed information.
- `gallery`: ordered `{ image_path, caption }` entries following the main evidence asset. The editor supports adding, editing, moving and removing entries before saving.

Existing case-study context, decisions, product workflow, evidence notes, shipped/advanced items, learning and stage remain editable. Auth, admin role checks, authenticator MFA, policies and deployment configuration are unchanged.

## Verification

TypeScript, targeted ESLint, production build and whitespace checks pass. Visual and runtime QA is performed on Vercel previews before promotion. Responsive QA uses the actual application in narrow browser frames; this validates responsive CSS and interactions, not physical device hardware or mobile browser performance.

## 29 September review refinements

Construction Billing opens by default when featured. Construction leads the project index; the other featured projects retain their saved order. Each selected project exposes ownership and one key decision beneath the index. The enterprise launcher now uses a flat contact sheet with all five source crops and a separate shared-rules label.

The Lab uses equal visual areas: real prototype screenshots for Real Wealth and HI-Quote; explicitly labeled concept flows for Archy and WAYU. Real Wealth uses a tighter browser crop of the same source file. A concept description with no image, live URL or repository is not labeled as a prototype. Admin fields remain the source of the descriptions and stages. Screenshot placeholders follow real load/error events and reserve space.

The architecture-to-product paragraph is visible. Supporting project records and the healthcare research note are visible rows, with no mismatched hidden-record counter. Display tracking is relaxed and sage/olive text darkened. Keyboard skip links sit within the top navigation area when focused, and target focusable content sections.

Motion is limited to short project/content fades, image opacity reveals and small link-arrow feedback, with reduced-motion overrides. Libraries.dev was reviewed; no effect package or WebGL dependency was added for static portfolio image loading.

## 30 September — About, evidence and action discoverability

The About section now leads with the existing portrait and visible biography. The heading is shorter, contact actions have explicit button treatments, and the five-step journey is retained at a smaller scale below the story. Intro, transition text, portrait and profile links still use the existing admin records. Custom arrow-separated journey stages remain supported.

The original Enterprise module launcher has been retired from the deployed assets at the owner's request. Its previous version remains recoverable in Git history. A new, explicitly reconstructed SVG shows the documented five modules, shared roles/approvals/data rules, and product delivery sequence. It is a conceptual product map, not a technical architecture or a fabricated application screen. Saved references to the retired filename fall back to the new map; the gallery filters the retired asset and removes duplicate main-image entries. Future admin-uploaded evidence remains supported.

The UI audit found case-study actions below the preview, small controls styled like captions, project changes triggered by incidental hover/focus, hidden mobile projects in a horizontal strip, and arrow-only Lab destinations. The primary case-study action now precedes the exhibit. Workflow and full-size controls use visible outlines and 44 px targets. Project selection is explicit; all mobile project choices are visible. Lab destinations have text labels, the contact closer labels its email action, and the mobile header retains a contact action. Hover feedback is subtle and respects reduced-motion preferences.

Libraries.dev was inspected again on 30 September, including its Border Beam playground with Line and Mono selected. The portfolio adapts that border-motion idea into a short CSS edge reveal on primary-action hover and keyboard focus, using the existing citron/olive palette. It has no ambient loop, layout movement, new runtime package or generated-image effect, and respects reduced motion.

Release verification: TypeScript, targeted ESLint, production build and whitespace checks pass. Browser QA covered desktop plus 320/390 px mobile and 768 px tablet frames, About portrait/story/stages, primary-action focus feedback, explicit project selection, workflow toggles, case-study navigation, image zoom/Escape/focus return, Lab disclosure, and visible mobile viewer controls. The Enterprise hero and gallery both resolve to the new SVG, with no retired screenshot reference in rendered media. Main actions measure at least 44 px tall; the checked homepage viewports have no page-level horizontal overflow. Admin save/auth flows were not re-exercised because their behavior was not changed. The preview-only responsive harness is excluded from the production tree.
