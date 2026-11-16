# Design verification — 16 November 2026

## Scope and method

The homepage/catalog, offer detail, company directory, company profile, unavailable-offer state, and all student/recruiter/admin workspace tabs were exercised in headless Microsoft Edge at 360, 768, 1024, 1440 and 1920px. This produced 80 layout cases. Desktop and mobile screenshots were inspected for representative public pages and mobile offer/workspace screens.

Automated axe scans covered the five public view types at 360 and 1440px, and each role's overview and profile. The recruiter publishing dialog was separately scanned and keyboard-tested. These results are not a claim of complete WCAG conformance or a substitute for assistive-technology user testing.

The functional suite contains the 11 original tests plus three design regressions. All 14 passed. One original test's exact accessible-name matcher was updated to accept the full visible offer-group label, which now includes its explanatory text for voice-control compatibility.

## Before / after checklist

| Area | Before | After |
| --- | --- | --- |
| Identity | Familiar palette and student illustration mixed with separate style layers | Original palette and illustration preserved; accessible action colors added |
| Styles | Multiple competing stylesheets and inline presentation | One shared stylesheet, separate token source, extracted presentation utilities; five obsolete CSS files removed |
| Header | 1024px overflow, including Arabic mode | Fits all five widths for all three roles; mobile menu available at intermediate widths |
| Footer | Small links and unconditional launcher spacing | One shared light footer; 44px link rows; launcher spacing only where needed; same-page back-to-top |
| Public typography | Small metadata, inconsistent headings and secondary text | Shared modular scale, fluid headings, larger readable metadata |
| Fonts | External Google Fonts requests | Four local variable WOFF2 files, roughly 140KB combined across Latin and Arabic; swap loading and licenses |
| Contrast | 44 homepage, 11 offer, 25–26 directory and 8 company-profile failures in the sampled views | No axe violations in final sampled public/workspace scans |
| Dialogs | Invisible controls remained focusable; Tab escaped | Closed dialogs hidden; background inert; Tab/Shift+Tab trapped; Escape and focus restoration |
| Forms | Inconsistent fields and native-only errors | Shared controls, disabled/invalid states, associated inline validation messages |
| Tables | Horizontal scrolling at narrow widths | Stacked labeled rows while preserving table markup |
| Offer actions | Apply/share below the long mobile description | Action card appears before the long mobile description |
| Motion | Heavy decorative blur plus text entrance animation | Original illustration motion retained; animated blur layers removed; heading paints immediately; reduced-motion supported |
| Icons | Repeated inline SVG shapes and different strokes | Shared local library of 13 SVG symbols with normalized 2px strokes; brand/hero art kept separate |
| Assets | No organized brand/favicon/social set | Logo variants, favicon PNG/SVG, touch/app/maskable icons, manifest, social SVG/PNG, state artwork |
| Missing page | Generic unavailable view only | Styled 404 page plus existing offer/company unavailable behavior |
| Documentation | No complete component contract | DESIGN_SYSTEM.md and design-system.html reference |
| Functionality | Demo application, posting, profiles and moderation flows | Preserved and covered by the passing regression suite |

## Responsive results

- 80 final layout cases: **zero page-level or table-container horizontal overflows**.
- Additional homepage checks exercised every role at all five widths.
- Arabic homepage layout was exercised at all five widths by the regression suite.
- Dialog keyboard checks confirmed focus containment and restoration.
- Static local references were checked: no missing linked scripts, styles or assets.

## Lighthouse

Mobile Lighthouse audits were run against local HTTP servers using Microsoft Edge. The original project snapshot and final project were served separately. The final run was performed after other browser audits finished to reduce CPU contention. These are local lab measurements, not field performance data.

| Route | Performance | Accessibility | Best practices |
| --- | ---: | ---: | ---: |
| Original homepage | 84 | 90 | 96 |
| Updated homepage | 86 | 100 | 100 |
| Updated offer detail | 96 | 100 | 100 |
| Updated companies directory | 99 | 100 | 100 |

The homepage still carries the larger interactive prototype script and shared readable CSS. Its performance score is not 100. Production compression, caching and route-specific delivery would need validation on the eventual host; no backend or deployment configuration was changed.

## Release notes and limits

- The shipping theme remains light, as requested.
- French content and the existing homepage language switch are preserved. Standalone pages/workspace translations were not invented.
- Configure the host to serve 404.html for unknown routes.
- Replace the relative Open Graph image URL with the final public absolute URL before sharing the deployed site.
- The manifest supplies application identity/icons, not offline support.
- Browser testing covered Edge/Chromium; Safari, Firefox and screen-reader user testing were not performed.
- No user data was deleted. Existing local demo data and role restrictions remain intact.
