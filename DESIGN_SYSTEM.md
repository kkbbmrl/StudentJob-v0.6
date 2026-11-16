# JobEtudiant design system

The product retains its blue/violet identity, student illustration, and light footer. Public pages and student, recruiter, and administrator workspaces share the same tokens and component styles. No framework or build step is required.

## Files and ownership

| File | Purpose |
| --- | --- |
| `tokens.css` | Color, type, spacing, radius, shadow, layout, motion and stacking tokens. Change shared values here. |
| `styles.css` | Shared components, responsive layouts, illustration styling, and named presentation utilities. |
| `ui.js` | Shared footer, keyboard tab navigation, validation presentation and empty-state artwork. |
| `assets/fonts/fonts.css` | Local variable WOFF2 font faces with `font-display: swap`. |
| `assets/icons/icons.js` | One local SVG symbol library, injected inline so direct `file://` previews work. |
| `assets/icons/ui.svg` | Portable copy of the same UI symbol set. |
| `design-system.html` | Visual reference for buttons, fields, statuses, cards, loading, pagination and notifications. |
| `tests/design.spec.cjs` | Regression coverage for responsive headers, dialog focus and mobile tables. |

The older dashboard, offers, design and directory stylesheets were consolidated or removed. Do not reintroduce another override stylesheet.

## Identity and color

- Brand blue `#4F6BFF` and violet `#7B5CFF` identify the product and illustration.
- Action blue `#3A52E8` and deeper violet `#6242D9` support readable white button labels.
- Text uses `--ink`, `--text`, `--muted`, and `--subtle`, rather than component-specific gray values.
- Backgrounds use `--bg`, `--surface`, and `--surface-2`; decorative boundaries use `--border`, controls use `--border-control`.
- Success `#147657`, warning `#8A5700`, and error `#B42318` pair with pale status surfaces and written labels. Color alone must never convey status.
- The shipped theme is light. A future theme should override semantic tokens, including contrasting foreground/background pairs, and repeat contrast verification.
- Category and company colors are data-driven accents. Never use an arbitrary company accent as small body text without checking contrast.

## Typography

Plus Jakarta Sans carries Latin headings and the wordmark; Inter handles body and interface text; Cairo handles Arabic. The fonts are local WOFF2 variable files, with licenses alongside them. Only the Latin body font is preloaded. Arabic fonts load when their Unicode ranges are needed.

The shared scale is 12, 14, 16, 18, 20, 24, 30, 36, 48 and 60px, expressed in rem tokens. Body text is 16px, secondary interface text 14px, and metadata at least 12px. Headings use `--text-hero`, `--heading-page` and `--heading-section` with fluid clamps. Use 1.2–1.3 heading line height, 1.6–1.75 body line height and 1.8 for Arabic body text. Arabic headings do not use Latin tracking.

## Spacing and layout

Use spacing tokens: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 and 96px. Borders, icon strokes, illustration geometry and optical letter spacing are not layout spacing and may use other values.

- Public container: 1200px maximum, centered, including responsive 16/24/32px gutters.
- Sections: 48px mobile, 64px tablet, 80px desktop.
- Cards: 24px padding, 20px radius; controls: 12px radius; dialogs: 24px radius.
- Use a 12-column conceptual desktop grid: half-width panels span six columns, catalog cards span four, detail content and actions divide the remaining space according to readable minimum widths.
- Dense tables become labeled stacked rows below 900px, retaining actual table markup and column headers for assistive technology.
- Mobile offer actions appear before the long description. The underlying descriptive content and submission flow remain unchanged.
- Favor content-driven breakpoints; verify at 360, 768, 1024, 1440 and 1920px and intermediate widths.
- Use logical properties (`padding-inline`, `margin-block`, `inset-inline-end`) for layouts that need RTL.

## Component contracts

| Component | Contract |
| --- | --- |
| Buttons | `.btn` with primary, secondary, ghost or warm variant. Standard height 48px; minimum interactive area 44px. Hover and active feedback, visible keyboard focus, native disabled state, `aria-busy` loading indicator. |
| Inputs/selects | `.input-field`, visible associated label, 48px minimum height, 16px text, native disabled/required behavior. Invalid fields receive `aria-invalid` and an associated error message. |
| Checkboxes/radios | Native controls, primary accent, 44px label interaction area. Preserve keyboard and checked semantics. |
| Cards | Shared border, radius and elevation. Separate content hierarchy from hover feedback; do not make static content pretend to be a button. |
| Tabs/filters | Existing selected/pressed state remains authoritative; keyboard arrow, Home and End navigation is provided for tab lists. |
| Tables | Preserve `th scope="col"`; generated cells include `data-label` for mobile presentation. Do not hide columns just to make a table fit. |
| Badges | 12px text, full radius, semantic color and visible status label. |
| Dialogs | Hidden dialogs are not focusable; open dialogs make the background inert, trap Tab and Shift+Tab, close on Escape and restore opener focus. |
| Toasts | Existing polite live region; consistent elevation, border radius and dismissal behavior. |
| Pagination | `.ui-pagination` uses native buttons, `aria-current="page"`, accessible previous/next names and native disabled endpoints. The component reference is illustrative; no pagination was added to product data flows. |
| Empty/error states | Existing message and recovery action, with decorative artwork carrying empty alt text. |
| Loading | Catalog skeleton behavior preserved; `.ui-skeleton-card` offers the shared visual pattern. Avoid inventing artificial loading delays for synchronous local actions. |
| Footer | One content source in `ui.js`; light background, shared container, 44px link rows and responsive columns. Extra bottom space is applied only where the demo launcher exists. |

States apply where meaningful: a static card does not need a disabled state, and a badge does not need a loading interaction.

## Motion

Use 120ms for direct feedback, 200ms for transitions, 320ms for entrances and the shared easing curve. Prefer transform/opacity. Keep illustrative geometry separate from interface layout. Reduced-motion mode removes animations and smooth scrolling and makes reveal content immediately visible. Do not add continuous decorative movement to tables or forms.

## Assets

- `assets/brand/logo-{horizontal,stacked,icon}-{light,dark,mono}.svg`: light means dark lettering for a light surface; dark means white lettering for a dark surface. Wordmarks use portable vector paths, not system-font substitution.
- `assets/icons/favicon.svg`, PNG 16/32, Apple touch icon 180, application icons 192/512 and a safe-area maskable 512 icon.
- `site.webmanifest`: app identity and icon references; this does not introduce offline support.
- `assets/social/social-preview.{svg,png}`: 1200×630 social card.
- `assets/illustrations/{empty,error,not-found}.svg`: consistent state illustrations.
- `404.html`: matching not-found page; the hosting service must be configured to use it for unknown URLs.

On deployment, make `og:image` an absolute URL on the real public hostname. A local `file://` prototype cannot provide a public social preview. Preserve the font licenses when distributing assets.

## Adding a page or component

1. Start from the public shell in `offer.html`, retaining the viewport, skip link, local fonts, shared styles, icon library and footer placeholder.
2. Use one descriptive `h1`, followed by semantic section headings, and the shared container.
3. Compose existing components; add a reusable named variant only when the existing contract cannot express the requirement.
4. Reference tokens instead of raw colors, arbitrary spacing, or inline presentation. Runtime company colors and animation transforms are data/behavior exceptions.
5. Keep public navigation destinations and role permissions intact. Workspaces share primitives but keep their task-specific navigation.
6. Preserve visible labels, semantic HTML and focus order. Do not truncate meaningful information to achieve artificial symmetry.
7. Run `npm install`, then `npm test`; inspect mobile, desktop and Arabic layout, focus states, empty/error states and reduced motion.

Do: change a shared token to update the product; test long titles; keep text contrast at least 4.5:1 for normal text; use one local icon library.

Don't: append page-specific overrides; use pale brand colors for small text; hide overflowing content to conceal a broken layout; change application data or permissions during visual refactors.

## Scope boundaries

All public pages and workspace tabs now use the shared FR/EN/AR lifecycle described below. Recruiter-authored text and edited profile values remain as written. No authentication, backend, payment, search, application or moderation functionality was added or removed.


## Shared language lifecycle

- i18n/fr.js, i18n/en.js and i18n/ar.js contain the product dictionaries, including the existing homepage copy, steps, testimonials, FAQ and ID-based demo-offer display mappings.
- i18n.js is the only language lifecycle. A small head initializer chooses saved language, then browser language, then FR. It sets html lang/dir before content is shown. The existing jobetudiant_lang storage key is retained with guarded access.
- Pages load dictionaries and the module before their view scripts. The i18n-pending class hides initial content until translations are applied. The stylesheet does not create a second theme or override file.
- Use I18n.t(key, parameters) (also available as t), I18n.setLanguage(lang), and I18n.apply(root). Page renderers subscribe to languagechange. Static content supports data-i18n, data-i18n-placeholder, data-i18n-aria-label and data-i18n-title.
- Keys use semantic namespaces such as companies.directory.title, offers.count.one, workspace.greeting, common.copy.*, interface.copy.*, demo.offers.<id>.* and demo.profiles.*. Parameter names must match across languages.
- I18n.number, date, currency, plural and relative wrap Intl. Arabic plural keys include zero, one, two, few, many and other. Existing business/status strings, select values, IDs and stored records remain canonical.
- The same 48px switcher is mounted in public headers and workspace top bars. Switching keeps the current URL and workspace tab and does not discard draft form values.
- The text/attribute binding registry supports existing generated markup without rebuilding forms. Registered French source fallbacks remain recognizable by the dev audit; new code should use semantic keys directly.
- Mark authored content with data-authored. The registry never translates inputs, textareas, SVG artwork, or marked content. Default profile/demo text may use translation mappings; edited values are retained.
- ui.js displays validation messages through the language module rather than browser-language validation text. Native date-picker presentation still follows browser/platform settings.
- Run npm run check:i18n. It fails on missing/extra keys, unknown static keys or mismatched parameters, and writes the visible source-literal inventory to reports/i18n-source-audit.json for review. Proper names, authored records, examples and registered source fallbacks are distinguished from missing translations; the static scanner is a review aid, not a full JavaScript dataflow analyzer.

## Named icon library

Icon(name, size, label) returns a local SVG use element. Size is sm, md or lg, backed by --icon-sm/md/lg (16/20/24px). Icons use a 24x24 grid, 2px strokes, round caps/joins and currentColor. They are decorative by default. Supply a label only when an icon itself needs an accessible name; normally the surrounding button has visible text or an aria-label.

The inline sprite supports direct file previews. assets/icons/ui.svg is the portable equivalent. Existing ui-* aliases remain for compatibility; new components use names. Brand marks and hero illustrations are separate from this library.

Names:

- Company: map-pin, briefcase, users, building, globe, calendar, badge-check, mail, phone.
- Offer: clock, banknote, laptop, file-text, tag, hourglass, heart, heart-outline, heart-filled, share.
- Navigation/actions: search, sliders, sort, menu, close, chevron-up/down/left/right, arrow-left/right, external-link, plus, edit, trash, check, download, upload, log-in, log-out, settings, bell, user, home.
- Feedback: info, success, warning, error, spinner.
- Categories: tutoring, events, design, translation, tech-data, retail, delivery.
- Roles/workspaces: student, recruiter, admin, dashboard, applications, messages, analytics.
- Social: linkedin, facebook, instagram, mail.

Only directional arrows, horizontal chevrons, external-link and login/logout mirror in RTL. Pins, hearts, company marks and social symbols retain orientation. The component reference includes the name, all three sizes and RTL behavior for every named icon. Heart states share the same geometry; spinner animation respects reduced motion.

## Company components

company-pages.js owns directory/profile presentation; offer-card.js is shared by company profiles and the homepage. Directory filters preserve their original values while translated labels are displayed. Search matches name or localized sector, and sorting uses localized name comparison or open-offer count.

The toolbar uses 5/3/2/2 desktop columns, two tablet columns and one mobile column. Controls are 48px high with 16px type and 12px radius. Cards use 24px padding and 20px radius, fixed 64px logo/monogram frames, readable sector/status badges and shared meta-item icon/label/value rows.

Verification is displayed only when a record explicitly supplies it; existing companies display a demo-company badge. Website and founding year are never invented. Optional missing facts use localized not-provided text, and missing logos retain their monograms. companyAccent computes a contrasting foreground and adjusts runtime accents when needed; stored colors are not changed.


## Offer detail dossier

The offer route uses offer-pages.js and the existing stylesheet. The hero groups the title, company link, and three icon-led facts in one white dossier card. The body retains the five semantic bullet-list sections, each with a named decorative icon. A sticky desktop action panel gives compensation, duration and work mode a clear hierarchy, followed by the existing apply/share actions. Below 1024px, this panel moves before the long description and becomes static.

All geometry, colors, typography, icon sizes and spacing use shared tokens. The sidebar width uses --offer-aside-width. Section headings keep their accessible names and the form IDs/submission behavior are retained. Compensation and the parameterized company link refresh on language changes without replacing an application draft.
