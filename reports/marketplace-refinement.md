# Homepage marketplace refinement

Scope: homepage header and marketplace intro, family cards, filters, chips and offer cards. Existing roles, filter values, stored records and navigation destinations are preserved.

## Before / after

| Before | After |
| --- | --- |
| Header pills 44/46px, mobile navigation below 1200px | Matching 48px pills; menu below 900px; compact navigation row at intermediate widths |
| Search/date/Arabic selects had different heights | All six filter controls exactly 48px with 16px type and visible labels |
| Uneven filter rows, wrapped chips | 5/3/2/2 desktop grid, two-column tablet, single-column mobile; snapping chip scroll |
| Results badge beside paragraph | Live count immediately above the offer grid |
| Text-only cards with unlimited titles | 16:10 media, 24px padding, two-line visible titles, company, deadline/location/pay, full-width action |
| No offer images or fallback | Seven local category illustrations; eager first three images, lazy remaining images; broken-image recovery |
| French-only labels in English/Arabic | Existing language lifecycle now localizes scoped labels, options, accessible names and seeded display titles |

## Localization map

| Key | FR | EN | AR |
| --- | --- | --- | --- |
| navCompanies | Entreprises | Companies | الشركات |
| locationLabel | Localisation | Location | الموقع |
| sortLabel | Trier par | Sort by | ترتيب حسب |
| typeLabel | Type d’opportunité | Opportunity type | نوع الفرصة |
| closingLabel | Clôture à partir du | Closing on or after | آخر موعد ابتداءً من |
| dateHint | jj/mm/aaaa | dd/mm/yyyy | يوم/شهر/سنة |
| workTitle | Emplois & travail | Jobs & work | الوظائف والعمل |
| workDescription | Emploi, temps partiel et travail indépendant | Employment, part-time work and freelancing | وظائف وعمل جزئي وعمل حر |
| developmentTitle | Services, stages & apprentissage | Services, internships & learning | الخدمات والتدريب والتعلّم |
| developmentDescription | Stages, services étudiants, formations et conférences | Internships, student services, courses and conferences | تدريب وخدمات طلابية ودورات ومؤتمرات |
| allTypes | Tous les types | All types | جميع الأنواع |
| deadline | Clôture | Deadline | آخر موعد |
| saveOffer | Sauvegarder | Save | حفظ |
| verified | Vérifié | Verified | موثّق |
| free | Gratuit | Free | مجاني |
| demoPay | Rémunération démo | Demo compensation | أجر توضيحي |
| studentAccess | Accès étudiant | Student access | متاح للطلاب |
| closedOffer | Offre clôturée | Offer closed | عرض مغلق |
| viewOffer | Voir l’offre | View offer | عرض التفاصيل |
| savedOffers | Offres sauvegardées | Saved offers | العروض المحفوظة |
| navigationLabel | Navigation principale | Main navigation | التنقل الرئيسي |
| languageLabel | Sélecteur de langue | Language selector | اختيار اللغة |
| familiesLabel | Familles d’offres | Offer families | مجموعات العروض |
| categoriesLabel | Catégories d’offres | Offer categories | فئات العروض |
| simLabel | Simulateur d’état UI | Interface state simulator | محاكي حالات الواجهة |
| menuLabel | Menu | Menu | القائمة |
| homeLabel | JobEtudiant DZ — Accueil | JobEtudiant DZ — Home | JobEtudiant DZ — الرئيسية |
| stateLoading | Chargement | Loading | جارٍ التحميل |
| catRetail | Vente et commerce | Retail | البيع والتجارة |
| catDelivery | Livraison et distribution | Delivery and distribution | التوصيل والتوزيع |
| catTech | Technique et saisie | Tech and data entry | التقنية وإدخال البيانات |
| types.job | Emploi | Job | وظيفة |
| types.parttime | Travail à temps partiel | Part-time work | عمل جزئي |
| types.freelance | Travail indépendant | Freelance work | عمل حر |
| types.internship | Stage | Internship | تدريب |
| types.service | Service étudiant | Student service | خدمة طلابية |
| types.course | Formation | Course | دورة تدريبية |
| types.conference | Conférence | Conference | مؤتمر |
| offerTitles.offer-internship | Stage — Développement web & mobile | Internship — Web & mobile development | تدريب — تطوير الويب وتطبيقات الهاتف |
| offerTitles.offer-course | Atelier pratique — Votre premier projet React | Practical workshop — Your first React project | ورشة تطبيقية — مشروعك الأول باستخدام React |
| offerTitles.offer-conference | Conférence — IA, métiers et avenir des étudiants | Conference — AI, careers and students’ futures | مؤتمر — الذكاء الاصطناعي والمهن ومستقبل الطلاب |
| offerTitles.offer-service | Accompagnement carrière — CV et entretien | Career coaching — CV and interview | إرشاد مهني — السيرة الذاتية والمقابلة |

## Decisions

- Existing container edges and 16/24/32px gutters are reused. No override stylesheet was added. New line-height, header/control-height and media-ratio aliases live in tokens.css.
- Family descriptions can wrap on narrow screens; text is not discarded to enforce a single line.
- Native date-picker segment order depends on browser/OS settings. A localized day/month/year hint and formatted selected-date text make the format explicit; filtering still uses the native ISO value.
- Company/technology names and recruiter-authored text remain as authored. Seed title translations are presentation mappings keyed by existing IDs.
- SVG files contain token-backed fallback colors for standalone rendering. Interface CSS uses semantic tokens.
- The original hero, lower homepage sections, footer and workspace design were outside this refinement scope.

## Verification

- npm test: 17 tests passed.
- 15 layout cases: FR/EN/AR at 360, 768, 1024, 1440 and 1920px. No horizontal overflow; all six filter controls measured 48px.
- New tests cover container edges, matching header pill heights, equal mobile field widths, long titles and missing-image recovery.
- Axe: zero violations in the sampled FR/EN/AR homepage scans. Automated checks do not replace assistive-technology user testing.

| Local mobile Lighthouse | Before | After |
| --- | ---: | ---: |
| performance | 74 | 81 |
| accessibility | 100 | 100 |
| best-practices | 96 | 100 |

These are local lab measurements and fluctuate between runs. The comparison uses a saved pre-refinement snapshot; no production performance claim is implied.
