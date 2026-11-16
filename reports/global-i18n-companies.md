# Shared languages, companies and icons — 16 November 2026

## Before / after checklist

| Area | Before | After |
| --- | --- | --- |
| Language lifecycle | Homepage-specific dictionaries and render calls | Shared i18n.js and separate FR/EN/AR dictionaries; page-specific renderers use one language event |
| Initialization | French HTML on every route | Saved choice, browser language, FR fallback; html lang/dir initialized before content appears |
| Switchers | Homepage only | Same 48px switcher in public headers and all workspace top bars |
| Persistence | Homepage language key | Same guarded key retained across pages; storage failure leaves the current session usable |
| Static and dynamic copy | French-only company, offer, workspace and footer strings | Translation bindings for text, placeholders, accessible names, tooltips, titles, metadata, feedback and validation |
| Forms and workspaces | Language changes could require rebuilding a view | Existing forms/tabs remain mounted; draft values and role are retained |
| Demo content | Several French-only seed fields | ID-based offer mappings and registered company/profile/demo-copy translations |
| Authored content | No explicit translation boundary | Authored offer text, names and edited profile values remain as written |
| Formatting | Locale handling spread across scripts | Shared Intl date, number, currency, plural and relative-date helpers |
| Company search | Company name only | Name or localized sector, existing city/sector values, localized sorting |
| Company toolbar | Inconsistent composition | Labeled 48px fields on 5/3/2/2 desktop grid, two tablet columns, one mobile column |
| Company cards | Compact fact blocks and two different actions | 24px padding, 20px radius, logo/monogram frame, sector and truthful demo/verified badge, icon-led metadata and full-width action |
| Company profiles | Separate compact offer rows | Identity header, optional website, five metadata facts, about/benefits and shared homepage offer cards |
| Missing data | No explicit contract | Monogram fallback, localized not-provided facts, zero-offer state, reset/retry states; no invented website or verification |
| Accent text | Direct arbitrary accent text | Runtime contrast helper selects an AA foreground and adjusts an accent if required, preserving records |
| Icons | Thirteen anonymous symbols and scattered sizes | Named 24x24 library, 2px strokes, 16/20/24px tokens, decorative defaults, RTL behavior and 66-name gallery |
| Development checks | Functional tests only | Key parity, interpolation/static-key checks and visible-source audit; language/company regression tests |

## Implementation notes

- Routes, select values, status comparisons, permissions and stored record formats are retained. The directory now defaults to alphabetical sorting; the existing mobile navigation test selects its intended company explicitly instead of depending on seed order.
- Company verification, founding year, website, phone and email are not fabricated. Existing companies show a demo badge; a record can supply optional facts later.
- The shared text binding registry supports registered source fallbacks in existing generated HTML. New UI should reference semantic keys directly. The dev report lists source literals, proper names and potential review items; it is not a full JavaScript dataflow analyzer.
- Browser/OS date-picker segment order remains platform-controlled. Display formatting and validation feedback follow the selected site language.
- Initial language scripts are deferred and fetched in parallel. Content is revealed once initial translations have been applied.
- No framework, backend, external translation service or additional runtime package was introduced.

## Verification

Final test, responsive, accessibility and Lighthouse results are recorded below after the final runs.

- Responsive matrix: **270 cases**, with no horizontal overflow. Public routes/unavailable states and every workspace tab were checked at 360, 768, 1024, 1440 and 1920px in FR/EN/AR.
- New regression cases verify language persistence and html direction, no French filter labels in English Companies UI, equal card heights, exact 48px fields, long company names, missing logos, zero-offer profiles, preservation of workspace role/tab/drafts, browser-language fallback without storage, and direct English-to-Arabic offer headings/metadata.
- Accessibility: **18 sampled axe scans**, zero reported violations, across the directory, profile, offer detail, 404, component reference and workspace in FR/EN/AR. This is automated coverage rather than a claim of full assistive-technology certification.
- Dictionary check: all language keys and interpolation parameters match. The source-copy inventory is in i18n-source-audit.json.
- The icon gallery includes **66 named states/icons**, plus compatibility aliases.

| Companies mobile Lighthouse | Before | After |
| --- | ---: | ---: |
| performance | 99 | 98 |
| accessibility | 100 | 100 |
| best-practices | 100 | 100 |

Lighthouse used local HTTP servers and Microsoft Edge, with the pre-change project snapshot served separately. These are lab measurements, not production field data. Initial scripts now load in parallel; no hosting compression/cache configuration was changed.

Firefox, Safari and manual screen-reader user testing were not performed. Optional company fields remain absent where the record does not provide them. Authored names and edited content may intentionally remain in their original language.

Final npm test result: **25 passed** (59.8 seconds). npm run check:i18n passed with **695 keys** and no parity/interpolation errors.
