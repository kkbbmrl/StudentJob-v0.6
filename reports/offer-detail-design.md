# Offer detail design refinement

The redesign applies to every offer.html detail view, including the supplied mis_001 example.

- Added one coherent dossier header with category/contract badges, company identity and location/deadline/opportunity facts.
- Added local-library icons for section headings, compensation, duration, work environment, navigation and application actions.
- Kept all responsibilities, profile, languages, qualities and conditions as semantic bullet lists.
- Reworked the action panel around compensation and the next step. It stays alongside the description on desktop and precedes it on smaller screens.
- Refined the application form header, spacing and action row while keeping apply, share, cancel and persistence behavior.
- Preserved the original blue/violet palette, shared footer, tokens and FR/EN/AR system. No offer records or permissions were changed.
- Fixed compensation and company-link presentation when switching from Arabic back to French.

Verification: 45 layout cases (three representative offers, three languages, five widths), with no horizontal overflow; nine sampled axe scans, with zero violations. Visual inspection covered the supplied tutoring offer on desktop and mobile. The existing application/share tests and the new offer-layout regression cover the flows.

Final npm test: 26 passed. Translation key check passed.
