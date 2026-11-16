# JobEtudiant

A student opportunities prototype for Algeria.

## Open the website

Open `index.html` in a browser. No installation or build is needed.
The optional Google Fonts fall back to system fonts when offline.

## Offers

The catalog has two families:

- **Emplois & travail:** jobs, part-time work, and freelance opportunities.
- **Services, stages & apprentissage:** student services, internships, courses, and conferences.

Filter by location, opportunity type, and closing date. Each offer opens a full,
scrollable `offer.html?id=…` page. Details include responsibilities, required profile,
language skills, qualities, and conditions, each displayed as bullet points.
Students can apply, track their application in the dashboard, or copy the offer URL.
Closed and moderated offers cannot receive applications through the detail page.

## Companies

`companies.html` lists demo employers with name, sector, location, size, and current
open-offer counts. Search and filter the directory, open a company profile, and browse
its offers. Publishing under a new employer name also creates its demo directory entry.
The directory layout is inspired by https://jobs.student-campuce.dz/companies; the
prototype uses its own branding and fictional company content.

## Demo workspaces

Select **Espace démo** to switch between student, recruiter, and admin.
All roles have editable profiles. Recruiters can publish offers; students track
applications; admins can verify users and moderate listings.

The recruiter form includes the offer family and type, location/work mode, closing
date, remuneration, duration, introduction, and five structured detail sections.
Write one point per line to create bullet lists. **Utiliser un exemple de stage
informatique** fills a sample that can be edited before publication.

## Prototype storage

Profiles, posted offers, applications, and moderation are stored in this browser.
**Réinitialiser la démo** restores the sample data. Accounts, payments, companies,
and verification are simulated; there is no backend or real authentication.

Seeded offers have stable URLs when the site is hosted. A local `file:` URL is only
usable on the same computer. Newly posted demo offers exist only in the posting
browser; sharing those between users requires shared server storage.
The original marketplace supports FR/EN/AR. New offer pages, companies, and dashboards
currently use French.

## Files

- `index.html`, `styles.css`, `script.js`: marketplace and existing flows.
- `styles.css`, `dashboard.js`: role workspaces.
- `offers-data.js`: shared seeded and locally stored offers/companies.
- `offers-catalog.js`: offer family filters and structured posting form.
- `offer.html`, `companies.html`, `offer-pages.js`, `styles.css`: detail pages and directory.
- `tests/`, `package.json`, `package-lock.json`, `playwright.config.cjs`: browser checks only.

## Browser checks

With Node.js and Microsoft Edge installed:

```sh
npm ci
npm test
```

Generated dependencies and test results are excluded from version control.

## Visual design

`tokens.css and styles.css` restores the original blue–violet, coral, and mint palette with a refreshed student-and-laptop illustration, floating accents, hover lifts, and restrained entrance animations. Reduced-motion preferences disable animation.

### Shared layout rules

All public pages use the same logo and footer. `tokens.css and styles.css` defines common content
widths, page gutters, heading levels, panel radii, field heights, button styles, table
spacing, and motion timing. Dashboards adapt the same system to their sidebar layout.
Layouts were checked at 320, 390, 768, and 1440 pixels, including each role and profile.


## Design system

The shared visual rules are documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
Open [design-system.html](design-system.html) for the component reference.
Use tokens.css for design decisions, styles.css for components and layout,
and ui.js for the shared footer and presentation accessibility helpers.
Fonts and image assets are self-hosted in assets/.

Run npm install and npm test to check the prototype and design regressions.
See [DESIGN_VERIFICATION.md](DESIGN_VERIFICATION.md) for the audit and verification results.
