    /* ========================================================================
       1. HTML SANITIZER & SAFE LOCALSTORAGE HELPERS
       ======================================================================== */
    function sanitizeHTML(input) {
      const str = String(input == null ? '' : input);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeGetStorage(key, fallback) {
      try {
        const val = window.localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : fallback;
      } catch (err) {
        return fallback;
      }
    }

    function safeSetStorage(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* Storage blocked in sandboxed context; degrade gracefully */
      }
    }

    /* ========================================================================
       2. TRILINGUAL DICTIONARY (FR / EN / AR with true RTL support)
       ======================================================================== */
    const I18N = window.JobTranslations;
    const CATEGORY_META = {
      tutoring: { color: 'var(--cat-tutoring)', bg: 'var(--cat-tutoring-bg)', count: 42 },
      events:   { color: 'var(--cat-events)',   bg: 'var(--cat-events-bg)',   count: 28 },
      design:   { color: 'var(--cat-design)',   bg: 'var(--cat-design-bg)',   count: 31 },
      writing:  { color: 'var(--cat-writing)',  bg: 'var(--cat-writing-bg)',  count: 19 },
      tech:     { color: 'var(--cat-tech)',     bg: 'var(--cat-tech-bg)',     count: 36 },
      retail:   { color: 'var(--cat-retail)',   bg: 'var(--cat-retail-bg)',   count: 24 },
      delivery: { color: 'var(--cat-delivery)', bg: 'var(--cat-delivery-bg)', count: 22 }
    };

    /* ========================================================================
       3. REALISTIC SAMPLE DATA IN ALL 3 LANGUAGES (9 MISSIONS + STEPS + FAQ)
       ======================================================================== */
    const INITIAL_MISSIONS = OfferStore.seedOffers;

    const HOW_TRACKS = Object.fromEntries(["student","employer"].map(role=>[role,Object.fromEntries(["fr","en","ar"].map(lang=>[lang,I18N[lang].homepageSteps[role]]))]));
    const TESTIMONIALS_DATA = I18N.fr.homepageTestimonials.map((item,index)=>Object.fromEntries(Object.keys(item).map(key=>[key,typeof item[key]==='string'&&["initials","color","textColor"].includes(key)?item[key]:Object.fromEntries(["fr","en","ar"].map(lang=>[lang,I18N[lang].homepageTestimonials[index][key]]))])));
    const FAQ_DATA = I18N.fr.homepageFaq.map((item,index)=>Object.fromEntries(Object.keys(item).map(key=>[key,Object.fromEntries(["fr","en","ar"].map(lang=>[lang,I18N[lang].homepageFaq[index][key]]))])));
    const state = {
      lang: I18n.language,
      missions: OfferStore.all(),
      savedIds: new Set(safeGetStorage('jobetudiant_saved', ['mis_001', 'mis_003'])),
      appliedIds: new Set(safeGetStorage('jobetudiant_applied', [])),
      activeCategory: 'all',
      activeWilaya: 'all',
      searchQuery: '',
      sortBy: 'featured',
      savedOnly: false,
      uiState: 'ready', // 'ready' | 'loading' | 'empty' | 'error'
      activeTrack: 'student',
      selectedMissionId: null,
      wordIndex: 0
    };

    if (!I18N[state.lang]) {
      state.lang = 'fr';
    }

    /* ========================================================================
       5. LOCALE & CURRENCY FORMATTING
       ======================================================================== */
    function formatNumber(num) {
      const dict = I18N[state.lang];
      try {
        return new Intl.NumberFormat(dict.locale).format(num);
      } catch (e) {
        return String(num);
      }
    }

    function formatDZD(amount) {
      const formatted = formatNumber(amount);
      return state.lang === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
    }

    /* ========================================================================
       6. RENDER FUNCTIONS (Marquee, Missions, How It Works, Testimonials, FAQ)
       ======================================================================== */
    function getCategoryLabel(catKey) {
      const dict = I18N[state.lang];
      const map = {
        tutoring: dict.catTutoring,
        events: dict.catEvents,
        design: dict.catDesign,
        writing: dict.catWriting,
        tech: dict.catTech,
        retail: dict.catRetail,
        delivery: dict.catDelivery
      };
      return map[catKey] || catKey;
    }

    function renderMarquee() {
      const cats = Object.keys(CATEGORY_META);
      const html = cats.map((cat) => {
        const meta = CATEGORY_META[cat];
        const label = sanitizeHTML(getCategoryLabel(cat));
        return `
          <button type="button" class="marquee-pill" data-marquee-cat="${cat}">
            <span class="marquee-dot" style="background: ${meta.color};"></span>
            <span>${label}</span>
            <span class="marquee-count">${formatNumber(meta.count)}</span>
          </button>
        `;
      }).join('');

      const t1 = document.getElementById('marquee-track-1');
      const t2 = document.getElementById('marquee-track-2');
      if (t1 && t2) {
        t1.innerHTML = html;
        t2.innerHTML = html;
        t2.inert = true;
      }
    }

    function getFilteredMissions() {
      const q = state.searchQuery.trim().toLowerCase();
      const lang = state.lang;

      let list = state.missions.filter((m) => {
        if (window.offerCatalog && !window.offerCatalog.matches(m)) return false;
        if (window.workspaceDemo && !window.workspaceDemo.isVisible(m.id)) return false;
        if (state.savedOnly && !state.savedIds.has(m.id)) return false;
        if (state.activeCategory !== 'all' && m.category !== state.activeCategory) return false;
        if (state.activeWilaya !== 'all') {
          if (state.activeWilaya === 'remote') {
            if (!m.isRemote) return false;
          } else if (m.wilaya !== state.activeWilaya) {
            return false;
          }
        }
        if (q) {
          const titleText = (m.title[lang] || m.title.fr).toLowerCase();
          const empText = (m.employer[lang] || m.employer.fr).toLowerCase();
          const cityText = (m.commune[lang] || m.commune.fr).toLowerCase();
          const skillsText = (m.skills[lang] || m.skills.fr).join(' ').toLowerCase();
          return titleText.includes(q) || empText.includes(q) || cityText.includes(q) || skillsText.includes(q);
        }
        return true;
      });

      if (state.sortBy === 'pay_desc') {
        list.sort((a, b) => b.payAmount - a.payAmount);
      } else if (state.sortBy === 'urgent') {
        list.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
      } else {
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
      }
      return list;
    }

    function renderMissions() {
      const grid = document.getElementById('missions-grid');
      const liveBadge = document.getElementById('results-count-live');
      const dict = I18N[state.lang];
      if (!grid) return;

      /* 1. Loading Skeleton State */
      if (state.uiState === 'loading') {
        if (liveBadge) liveBadge.textContent = '...';
        grid.innerHTML = Array.from({ length: 6 }).map(() => `
          <div class="skeleton-card" aria-hidden="true">
            <div class="u-display-flex u-justify-content-space-between">
              <div class="skeleton-box u-inline-size-95px u-block-size-24px"></div>
              <div class="skeleton-box u-inline-size-32px u-block-size-32px u-border-radius-50"></div>
            </div>
            <div class="skeleton-box u-inline-size-90 u-block-size-22px"></div>
            <div class="skeleton-box u-inline-size-65 u-block-size-18px"></div>
            <div class="skeleton-box u-inline-size-100 u-block-size-58px u-border-radius-12px"></div>
            <div class="u-display-flex u-justify-content-space-between u-align-items-center">
              <div class="skeleton-box u-inline-size-110px u-block-size-28px"></div>
              <div class="skeleton-box u-inline-size-96px u-block-size-38px u-border-radius-12px"></div>
            </div>
          </div>
        `).join('');
        return;
      }

      /* 2. Error State */
      if (state.uiState === 'error') {
        if (liveBadge) liveBadge.textContent = '0';
        grid.innerHTML = `
          <div class="feedback-state-box" role="alert">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="#FFE6E2"/>
              <path d="M32 20v14M32 42h.02" stroke="#FF6B5A" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <h3 class="u-font-size-text-xl">${sanitizeHTML(dict.errorTitle)}</h3>
            <p class="u-font-size-text-sm u-color-muted u-max-inline-size-46ch">${sanitizeHTML(dict.errorDesc)}</p>
            <button type="button" class="btn btn-primary" data-action="retry-load">${sanitizeHTML(dict.btnRetry)}</button>
          </div>
        `;
        return;
      }

      const filtered = state.uiState === 'empty' ? [] : getFilteredMissions();

      if(liveBadge)liveBadge.textContent=I18n.plural('offers.results',filtered.length);

      /* 3. Empty State */
      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="feedback-state-box">
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
              <circle cx="34" cy="34" r="30" fill="#E4E9FF"/>
              <circle cx="31" cy="31" r="11" stroke="#4F6BFF" stroke-width="3.2"/>
              <line x1="39.5" y1="39.5" x2="48" y2="48" stroke="#7B5CFF" stroke-width="3.2" stroke-linecap="round"/>
            </svg>
            <h3 class="u-font-size-text-xl">${sanitizeHTML(dict.emptyTitle)}</h3>
            <p class="u-font-size-text-sm u-color-muted u-max-inline-size-46ch">${sanitizeHTML(dict.emptyDesc)}</p>
            <button type="button" class="btn btn-secondary" data-action="clear-all-filters">${sanitizeHTML(dict.btnReset)}</button>
          </div>
        `;
        return;
      }

      /* 4. Ready State: Render Mission Cards */
      grid.innerHTML=filtered.map((m,index)=>OfferCard(m,{index,saved:state.savedIds.has(m.id),applied:state.appliedIds.has(m.id),saveButton:true})).join('');
    }

    function renderHowItWorks() {
      const container = document.getElementById('how-steps-grid');
      if (!container) return;
      const steps = HOW_TRACKS[state.activeTrack][state.lang] || HOW_TRACKS[state.activeTrack].fr;
      container.innerHTML = steps.map((st) => `
        <div class="step-card">
          <div class="step-num-badge">${sanitizeHTML(st.num)}</div>
          <h3 class="u-font-size-text-lg u-margin-block-end-space-2">${sanitizeHTML(st.title)}</h3>
          <p class="u-font-size-text-sm u-color-muted">${sanitizeHTML(st.desc)}</p>
        </div>
      `).join('');
    }

    function renderTestimonials() {
      const container = document.getElementById('testimonials-grid');
      if (!container) return;
      container.innerHTML = TESTIMONIALS_DATA.map((item) => `
        <article class="testimonial-card">
          <div>
            <div class="u-display-flex u-align-items-center u-justify-content-space-between u-margin-block-end-space-3">
              <span class="u-color-sun-400 u-letter-spacing-2px" aria-label="5 étoiles">★★★★★</span>
              <span class="badge u-background-mint-100 u-color-mint-600">${sanitizeHTML(item.badge[state.lang] || item.badge.fr)}</span>
            </div>
            <blockquote class="testimonial-quote">${sanitizeHTML(item.quote[state.lang] || item.quote.fr)}</blockquote>
          </div>
          <div class="testimonial-author">
            <div class="pillar-icon" style="inline-size: 42px; block-size: 42px; border-radius: 50%; background: ${item.color}; color: ${item.textColor}; font-weight: 800; font-size: var(--text-sm);">
              ${sanitizeHTML(item.initials)}
            </div>
            <div>
              <div class="u-font-weight-800 u-font-size-text-sm u-color-ink">${sanitizeHTML(item.name[state.lang] || item.name.fr)}</div>
              <div class="u-font-size-text-xs u-color-muted">${sanitizeHTML(item.role[state.lang] || item.role.fr)}</div>
            </div>
          </div>
        </article>
      `).join('');
    }

    function renderFaq() {
      const container = document.getElementById('faq-list');
      if (!container) return;
      container.innerHTML = FAQ_DATA.map((item, idx) => {
        const isOpen = idx === 0;
        const q = sanitizeHTML(item.q[state.lang] || item.q.fr);
        const a = sanitizeHTML(item.a[state.lang] || item.a.fr);
        return `
          <div class="faq-item ${isOpen ? 'is-open' : ''}">
            <button
              type="button"
              class="faq-trigger"
              aria-expanded="${isOpen ? 'true' : 'false'}"
              data-faq-index="${idx}"
            >
              <span>${q}</span>
              <span class="faq-chevron" aria-hidden="true">
                <svg class="icon icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="16"><use href="#ui-13"></use></svg>
              </span>
            </button>
            <div class="faq-panel">
              <div class="faq-panel-inner">
                <p class="faq-answer">${a}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    /* ========================================================================
       7. SLIDING FILTER PILL INDICATOR (LTR & RTL AWARE)
       ======================================================================== */
    function updateFilterIndicator() {
      const track = document.getElementById('filter-pills-track');
      const indicator = document.getElementById('filter-indicator');
      if (!track || !indicator) return;
      const activeBtn = track.querySelector(`.filter-pill-btn[data-category="${state.activeCategory}"]`);
      if (!activeBtn) return;

      const trackRect = track.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      indicator.style.inlineSize = `${btnRect.width}px`;

      if (document.documentElement.dir === 'rtl') {
        const offsetRight = trackRect.right - btnRect.right;
        indicator.style.transform = `translate3d(${-offsetRight}px, 0, 0)`;
      } else {
        const offsetLeft = btnRect.left - trackRect.left;
        indicator.style.transform = `translate3d(${offsetLeft}px, 0, 0)`;
      }
    }

    /* ========================================================================
       8. LANGUAGE & RTL SWITCHER
       ======================================================================== */
    function applyLanguage(lang, {renderCatalog = true} = {}) {
      if (I18n.language !== lang) { I18n.setLanguage(lang); return; }
      if (!I18N[lang]) return;
      state.lang = lang;
      safeSetStorage('jobetudiant_lang', lang);

      const dict = I18N[lang];
      document.documentElement.lang = lang;
      document.documentElement.dir = dict.dir;

      /* Update language switcher buttons */
      document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
      });

      /* Update skip link */
      const skipEl = document.getElementById('skip-link-el');
      if (skipEl) skipEl.textContent = dict.skipLink;

      /* Translate all data-i18n elements */
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });

      /* Translate placeholders */
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
          el.setAttribute('placeholder', dict[key]);
        }
      });

      window.marketplaceLabels = dict;
      document.querySelector('#saved-filter-toggle')?.setAttribute('aria-label',dict.savedOffers+' '+state.savedIds.size);
      document.querySelectorAll('#opportunity-filter option').forEach(option=>{option.textContent=option.value==='all'?dict.allTypes:dict.types[option.value];});
      const attrs=[['.primary-nav','aria-label','navigationLabel'],['.lang-switcher','aria-label','languageLabel'],['.offer-groups','aria-label','familiesLabel'],['#filter-pills-track','aria-label','categoriesLabel'],['.state-sim-buttons','aria-label','simLabel'],['#mobile-menu-btn','aria-label','menuLabel'],['#saved-filter-toggle','title','savedOffers'],['.marketplace-header .brand-logo','aria-label','homeLabel']];
      attrs.forEach(([selector,attr,key])=>document.querySelector(selector)?.setAttribute(attr,dict[key]));
      document.querySelector('#closing-filter')?.setAttribute('lang',lang==='en'?'en-GB':lang);
      /* Update rotating word immediately */
      const rotEl = document.getElementById('rotating-word');
      if (rotEl && dict.rotatingWords) {
        state.wordIndex = 0;
        rotEl.textContent = dict.rotatingWords[0];
      }

      /* Format static DZD preview tags */
      document.querySelectorAll('.js-dzd').forEach((el) => {
        const amt = Number(el.getAttribute('data-amount') || 6000);
        el.textContent = formatDZD(amt);
      });

      /* Re-render dynamic sections */
      renderMarquee();
      if (renderCatalog) renderMissions();
      renderHowItWorks();
      renderTestimonials();
      renderFaq();
      updateCalculatorDisplay();

      /* Recalculate sliding indicator after layout direction settles */
      window.requestAnimationFrame(() => {
        updateFilterIndicator();
      });
    }

    /* ========================================================================
       9. TOAST NOTIFICATION SYSTEM (Spring Slide-in + Auto-dismiss)
       ======================================================================== */
    function showToast(message) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast-item';
      toast.innerHTML = `
        <div class="u-display-flex u-align-items-center u-gap-0-55rem u-font-size-text-sm u-font-weight-600">
          <span class="u-color-mint-500">●</span>
          <span>${sanitizeHTML(message)}</span>
        </div>
        <button class="u-color-rgba-255-255-255-0-7 u-font-size-text-sm" type="button" aria-label="Fermer">✕</button>
        <div class="toast-progress" aria-hidden="true"></div>
      `;

      const closeBtn = toast.querySelector('button');
      const removeToast = () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      };
      if (closeBtn) closeBtn.addEventListener('click', removeToast);
      setTimeout(removeToast, 3600);
      container.appendChild(toast);
    }

    /* ========================================================================
       10. CONFETTI BURST (Respects prefers-reduced-motion)
       ======================================================================== */
    function triggerConfetti() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const layer = document.getElementById('confetti-layer');
      if (!layer) return;

      const colors = ['#4F6BFF', '#7B5CFF', '#FF6B5A', '#FFC83D', '#14C8A0', '#38BDF8', '#FF7AB6'];
      for (let i = 0; i < 36; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.backgroundColor = colors[i % colors.length];
        piece.style.insetInlineStart = `${45 + (Math.random() * 16 - 8)}%`;
        piece.style.insetBlockStart = '38%';
        const tx = (Math.random() - 0.5) * 360;
        const ty = (Math.random() * 260) + 60;
        const rot = (Math.random() - 0.5) * 520;
        piece.style.setProperty('--tx', `${tx}px`);
        piece.style.setProperty('--ty', `${ty}px`);
        piece.style.setProperty('--rot', `${rot}deg`);
        layer.appendChild(piece);
        setTimeout(() => {
          if (piece.parentNode) piece.parentNode.removeChild(piece);
        }, 1200);
      }
    }

    /* ========================================================================
       11. CALCULATOR & MODALS LOGIC
       ======================================================================== */
    function updateCalculatorDisplay() {
      const range = document.getElementById('calc-range');
      if (!range) return;
      const val = Number(range.value || 12000);
      const grossLabel = document.getElementById('calc-gross-label');
      const rowGross = document.getElementById('calc-row-gross');
      const rowEmp = document.getElementById('calc-row-emp-fee');
      const rowNet = document.getElementById('calc-row-net');

      if (grossLabel) grossLabel.textContent = formatDZD(val);
      if (rowGross) rowGross.textContent = formatDZD(val);
      if (rowEmp) rowEmp.textContent = formatDZD(300);
      if (rowNet) rowNet.textContent = formatDZD(val);
    }

    const modalFocus = new Map();
    function openModal(modalId) {
      if (modalId === 'post-modal' && (window.LiveApp?.enabled?window.LiveApp.user?.role:window.workspaceDemo?.getRole()) !== 'recruiter') return;
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modalFocus.set(modalId, document.activeElement);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      [...document.body.children].forEach(el => {
        if (el !== modal && !['SCRIPT','LINK'].includes(el.tagName)) {
          el.dataset.modalPreviousInert = String(el.inert);
          el.inert = true;
        }
      });
      const firstInput = modal.querySelector('input, textarea, button');
      if (firstInput) firstInput.focus();
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal?.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.querySelectorAll('[data-modal-previous-inert]').forEach(el => {
        el.inert = el.dataset.modalPreviousInert === 'true';
        delete el.dataset.modalPreviousInert;
      });
      modalFocus.get(modalId)?.focus();
      modalFocus.delete(modalId);
    }

    document.addEventListener('keydown', event => {
      const modal = document.querySelector('.modal-backdrop.is-open');
      if (!modal || event.key !== 'Tab') return;
      const items = [...modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
    });

    function openApplyModal(missionId) {
      const mission = state.missions.find((m) => m.id === missionId);
      if (!mission) return;
      state.selectedMissionId = missionId;

      const summaryEl = document.getElementById('apply-mission-summary');
      const formBody = document.getElementById('apply-modal-body');
      const successView = document.getElementById('apply-success-view');
      const pitchInput = document.getElementById('applicant-pitch');

      if (formBody) formBody.style.display = 'block';
      if (successView) successView.style.display = 'none';

      const title = sanitizeHTML(mission.title[state.lang] || mission.title.fr);
      const emp = sanitizeHTML(mission.employer[state.lang] || mission.employer.fr);
      const commune = sanitizeHTML(mission.commune[state.lang] || mission.commune.fr);

      if (summaryEl) {
        summaryEl.innerHTML = `
          <div class="u-font-weight-800 u-color-ink u-margin-block-end-0-25rem">${title}</div>
          <div class="u-font-size-text-xs u-color-muted u-display-flex u-justify-content-space-between">
            <span>${emp} · ${commune}</span>
            <strong class="u-color-brand-600">${formatDZD(mission.payAmount)}</strong>
          </div>
        `;
      }

      if (pitchInput) {
        if (state.lang === 'ar') {
          pitchInput.value = 'مرحباً، أنا طالبة جامعية موثقة ومتاحة في المواعيد المحددة لإنجاز المهمة بدقة.';
        } else if (state.lang === 'en') {
          pitchInput.value = 'Hello! I am a verified university student available at the requested schedule and ready to start.';
        } else {
          pitchInput.value = 'Bonjour, je suis disponible aux créneaux indiqués et prête à réaliser cette mission avec rigueur.';
        }
      }

      openModal('apply-modal');
    }

    /* ========================================================================
       12. INITIALIZATION & EVENT LISTENERS
       ======================================================================== */
    window.addEventListener('languagechange',()=>applyLanguage(I18n.language));
    window.jobWorkspace = { state, initialMissions: INITIAL_MISSIONS, renderMissions, openModal, closeModal, openApplyModal, showToast, safeSetStorage };
    document.addEventListener('DOMContentLoaded', () => {
      /* Initial Render */
      const savedBadge = document.getElementById('saved-count-badge');
      if (savedBadge) savedBadge.textContent = String(state.savedIds.size);
      applyLanguage(state.lang, {renderCatalog: false});

      /* Mobile Menu Drawer Toggle */
      const mobileBtn = document.getElementById('mobile-menu-btn');
      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileBtn && mobileDrawer) {
        mobileBtn.addEventListener('click', () => {
          const isOpen = mobileDrawer.classList.toggle('is-open');
          mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        mobileDrawer.querySelectorAll('.mobile-nav-item').forEach((link) => {
          link.addEventListener('click', () => {
            mobileDrawer.classList.remove('is-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
          });
        });
      }

      /* Sticky Header Scroll Blur + Progress Bar */
      const headerEl = document.getElementById('site-header');
      const progressEl = document.getElementById('scroll-progress');
      window.addEventListener('scroll', () => {
        const y = window.scrollY || window.pageYOffset;
        if (headerEl) {
          headerEl.classList.toggle('is-scrolled', y > 16);
        }
        if (progressEl) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = docHeight > 0 ? Math.min(1, Math.max(0, y / docHeight)) : 0;
          progressEl.style.transform = `scaleX(${ratio})`;
        }
      }, { passive: true });

      /* Rotating Headline Word (Every 2.8s) */
      setInterval(() => {
        if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rotEl = document.getElementById('rotating-word');
        const words = I18N[state.lang].rotatingWords;
        if (!rotEl || !words || !words.length) return;

        rotEl.classList.add('is-switching');
        setTimeout(() => {
          state.wordIndex = (state.wordIndex + 1) % words.length;
          rotEl.textContent = words[state.wordIndex];
          rotEl.classList.remove('is-switching');
        }, 210);
      }, 2800);

      /* Pause Infinite Animations When Off-Screen or Tab Hidden */
      document.addEventListener('visibilitychange', () => {
        document.body.classList.toggle('is-paused', document.hidden);
      });

      if ('IntersectionObserver' in window) {
        /* Scroll Reveal Observer */
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

        /* Count-Up Stats Observer */
        const statsObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = Number(el.getAttribute('data-target') || 0);
            statsObserver.unobserve(el);

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              el.textContent = formatNumber(target);
              return;
            }

            const duration = 1100;
            const startTime = performance.now();
            const step = (now) => {
              const progress = Math.min(1, (now - startTime) / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = formatNumber(Math.round(target * eased));
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            window.requestAnimationFrame(step);
          });
        }, { threshold: 0.35 });

        document.querySelectorAll('.js-counter').forEach((el) => statsObserver.observe(el));

        /* Pause Hero & Marquee when scrolled off-screen */
        const ambientObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle('is-paused', !entry.isIntersecting);
          });
        }, { threshold: 0.02 });

        const heroSec = document.getElementById('top');
        const marqueeSec = document.getElementById('marquee-section');
        if (heroSec) ambientObserver.observe(heroSec);
        if (marqueeSec) ambientObserver.observe(marqueeSec);
      } else {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      }

      /* Hero Fast Search Form -> Scrolls & Filters Missions */
      const heroForm = document.getElementById('hero-search-form');
      if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const kwInput = document.getElementById('hero-keyword-input');
          const wilayaSel = document.getElementById('hero-wilaya-select');
          const mainSearch = document.getElementById('mission-search-input');
          const mainWilaya = document.getElementById('wilaya-filter');

          state.searchQuery = kwInput ? kwInput.value : '';
          state.activeWilaya = wilayaSel ? wilayaSel.value : 'all';
          state.uiState = 'ready';

          if (mainSearch) mainSearch.value = state.searchQuery;
          if (mainWilaya) mainWilaya.value = state.activeWilaya;

          renderMissions();
          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
        });
      }

      /* Hero Popular Quick Tag Chips */
      document.querySelectorAll('[data-quick-filter]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const val = chip.getAttribute('data-quick-filter');
          state.uiState = 'ready';
          if (val === 'remote') {
            state.activeWilaya = 'remote';
            const wilayaEl = document.getElementById('wilaya-filter');
            if (wilayaEl) wilayaEl.value = 'remote';
          } else {
            state.activeCategory = val;
            document.querySelectorAll('.filter-pill-btn').forEach((b) => {
              b.setAttribute('aria-selected', b.dataset.category === val ? 'true' : 'false');
            });
            updateFilterIndicator();
          }
          renderMissions();
          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
        });
      });

      /* Marquee Category Click */
      const marqueeSecEl = document.getElementById('marquee-section');
      if (marqueeSecEl) {
        marqueeSecEl.addEventListener('click', (e) => {
          const pill = e.target.closest('[data-marquee-cat]');
          if (!pill) return;
          const cat = pill.getAttribute('data-marquee-cat');
          state.activeCategory = cat;
          state.uiState = 'ready';
          document.querySelectorAll('.filter-pill-btn').forEach((b) => {
            b.setAttribute('aria-selected', b.dataset.category === cat ? 'true' : 'false');
          });
          updateFilterIndicator();
          renderMissions();
          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
        });
      }

      /* Filter Pills with Brief Shimmer Loader & Sliding Active Indicator */
      document.querySelectorAll('.filter-pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cat = btn.dataset.category;
          state.activeCategory = cat;
          document.querySelectorAll('.filter-pill-btn').forEach((b) => {
            b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
          });
          updateFilterIndicator();

          /* Brief skeleton transition to showcase responsive loading state */
          state.uiState = 'loading';
          renderMissions();
          setTimeout(() => {
            state.uiState = 'ready';
            renderMissions();
          }, 220);
        });
      });

      window.addEventListener('resize', updateFilterIndicator);

      /* Search, Wilaya, Sort & Reset Controls */
      const searchInput = document.getElementById('mission-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          state.searchQuery = e.target.value;
          state.uiState = 'ready';
          renderMissions();
        });
      }

      const wilayaFilter = document.getElementById('wilaya-filter');
      if (wilayaFilter) {
        wilayaFilter.addEventListener('change', (e) => {
          state.activeWilaya = e.target.value;
          state.uiState = 'ready';
          renderMissions();
        });
      }

      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          state.sortBy = e.target.value;
          state.uiState = 'ready';
          renderMissions();
        });
      }

      const resetAllFilters = () => {
        window.offerCatalog?.reset();
        state.activeCategory = 'all';
        state.activeWilaya = 'all';
        state.searchQuery = '';
        state.sortBy = 'featured';
        state.savedOnly = false;
        state.uiState = 'ready';

        if (searchInput) searchInput.value = '';
        if (wilayaFilter) wilayaFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'featured';
        const savedToggle = document.getElementById('saved-filter-toggle');
        if (savedToggle) savedToggle.setAttribute('aria-pressed', 'false');

        document.querySelectorAll('.filter-pill-btn').forEach((b) => {
          b.setAttribute('aria-selected', b.dataset.category === 'all' ? 'true' : 'false');
        });
        document.querySelectorAll('.state-sim-btn').forEach((b) => {
          b.setAttribute('aria-pressed', b.dataset.simState === 'ready' ? 'true' : 'false');
        });

        updateFilterIndicator();
        renderMissions();
      };

      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

      /* Saved Missions Header Toggle */
      const savedToggleBtn = document.getElementById('saved-filter-toggle');
      if (savedToggleBtn) {
        savedToggleBtn.addEventListener('click', () => {
          state.savedOnly = !state.savedOnly;
          state.uiState = 'ready';
          savedToggleBtn.setAttribute('aria-pressed', state.savedOnly ? 'true' : 'false');
          savedToggleBtn.setAttribute('aria-label',I18N[state.lang].savedOffers+' '+state.savedIds.size);
          renderMissions();
          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
          showToast(state.savedOnly ? 'Affichage des offres sauvegardées ♥' : 'Affichage de toutes les offres');
        });
      }

      /* UI State Simulator Buttons (Normal / Skeleton / Empty / Error) */
      document.querySelectorAll('.state-sim-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetState = btn.dataset.simState;
          state.uiState = targetState;
          document.querySelectorAll('.state-sim-btn').forEach((b) => {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          renderMissions();
        });
      });

      /* Delegated Events on Missions Grid (Save Heart, Apply, Retry, Clear) */
      const missionsGrid = document.getElementById('missions-grid');
      if (missionsGrid) {
        missionsGrid.addEventListener('click', (e) => {
          const detailButton = e.target.closest('[data-action="details"]');
          const detailCard = e.target.closest('[data-mission-id]');
          if (detailButton || (detailCard && !e.target.closest('button, a, input, select'))) {
            window.workspaceDemo?.showDetails(detailButton?.dataset.id || detailCard.dataset.missionId);
            return;
          }
          const saveBtn = e.target.closest('[data-action="toggle-save"]');
          if (saveBtn) {
            const id = saveBtn.getAttribute('data-id');
            if (state.savedIds.has(id)) {
              state.savedIds.delete(id);
              saveBtn.setAttribute('aria-pressed', 'false');
              showToast('Offre retirée des favoris');
            } else {
              state.savedIds.add(id);
              saveBtn.setAttribute('aria-pressed', 'true');
              saveBtn.classList.remove('is-popping');
              void saveBtn.offsetWidth;
              saveBtn.classList.add('is-popping');
              showToast('Offre sauvegardée dans vos favoris ♥');
            }
            safeSetStorage('jobetudiant_saved', Array.from(state.savedIds));
            const badge = document.getElementById('saved-count-badge');
            if (badge) badge.textContent = String(state.savedIds.size);
            if (state.savedOnly) renderMissions();
            return;
          }

          const applyBtn = e.target.closest('[data-action="open-apply"]');
          if (applyBtn) {
            const id = applyBtn.getAttribute('data-id');
            openApplyModal(id);
            return;
          }

          const retryBtn = e.target.closest('[data-action="retry-load"]');
          if (retryBtn) {
            state.uiState = 'loading';
            renderMissions();
            setTimeout(() => {
              state.uiState = 'ready';
              document.querySelectorAll('.state-sim-btn').forEach((b) => {
                b.setAttribute('aria-pressed', b.dataset.simState === 'ready' ? 'true' : 'false');
              });
              renderMissions();
              showToast('Connexion rétablie · Offres chargées');
            }, 420);
            return;
          }

          const clearBtn = e.target.closest('[data-action="clear-all-filters"]');
          if (clearBtn) {
            resetAllFilters();
          }
        });
      }

      /* How It Works Track Switcher */
      document.querySelectorAll('.track-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeTrack = btn.dataset.track;
          document.querySelectorAll('.track-tab-btn').forEach((b) => {
            b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
          });
          renderHowItWorks();
        });
      });

      /* DZD Earnings Calculator Slider */
      const calcRange = document.getElementById('calc-range');
      if (calcRange) {
        calcRange.addEventListener('input', updateCalculatorDisplay);
      }
      const calcCtaBtn = document.getElementById('calc-cta-btn');
      if (calcCtaBtn) {
        calcCtaBtn.addEventListener('click', () => {
          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
        });
      }

      /* FAQ Accordion Delegation + Keyboard Navigation */
      const faqList = document.getElementById('faq-list');
      if (faqList) {
        faqList.addEventListener('click', (e) => {
          const trigger = e.target.closest('.faq-trigger');
          if (!trigger) return;
          const item = trigger.closest('.faq-item');
          if (!item) return;
          const isOpen = item.classList.toggle('is-open');
          trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      /* Footer Campus City Quick Filter Links */
      document.querySelectorAll('[data-campus-city]').forEach((link) => {
        link.addEventListener('click', () => {
          const city = link.getAttribute('data-campus-city');
          state.activeWilaya = city;
          state.uiState = 'ready';
          if (wilayaFilter) wilayaFilter.value = city;
          renderMissions();
        });
      });

      /* Apply Modal Submission (Confetti + Animated SVG Checkmark) */
      const applyForm = document.getElementById('apply-form');
      if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameVal = sanitizeHTML(document.getElementById('applicant-name').value);
          if (state.selectedMissionId) {
            state.appliedIds.add(state.selectedMissionId);
            safeSetStorage('jobetudiant_applied', Array.from(state.appliedIds));
          }

          const formBody = document.getElementById('apply-modal-body');
          const successView = document.getElementById('apply-success-view');
          const successDesc = document.getElementById('apply-success-desc');

          if (formBody) formBody.style.display = 'none';
          if (successView) successView.style.display = 'block';
          if (successDesc) {
            successDesc.textContent = `${nameVal} — Le recruteur a reçu votre profil vérifié et vous répondra sous 24h.`;
          }

          triggerConfetti();
          renderMissions();
          showToast('Candidature envoyée au recruteur !');
        });
      }

      document.getElementById('close-apply-modal').addEventListener('click', () => closeModal('apply-modal'));
      document.getElementById('cancel-apply-btn').addEventListener('click', () => closeModal('apply-modal'));
      document.getElementById('done-apply-btn').addEventListener('click', () => closeModal('apply-modal'));

      /* Post Mission Modal Triggers & Submission */
      const openPostTriggers = ['header-post-btn', 'mobile-post-btn', 'hero-post-btn', 'final-post-btn', 'footer-post-link'];
      openPostTriggers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('post-modal');
          });
        }
      });

      document.getElementById('close-post-modal').addEventListener('click', () => closeModal('post-modal'));
      document.getElementById('cancel-post-btn').addEventListener('click', () => closeModal('post-modal'));

      const postForm = document.getElementById('post-mission-form');
      if (postForm) {
        postForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if ((window.LiveApp?.enabled?window.LiveApp.user?.role:window.workspaceDemo?.getRole()) !== 'recruiter' || !postForm.reportValidity()) return;
          const rawTitle = document.getElementById('post-title-input').value.trim();
          const cat = document.getElementById('post-cat-select').value;
          const wilaya = document.getElementById('post-wilaya-select').value;
          const pay = Number(document.getElementById('post-pay-input').value || 8000);
          const duration = document.getElementById('post-duration-input').value.trim();
          const employer = document.getElementById('post-employer-input').value.trim();
          const workMode = document.getElementById('post-mode').value;
          const description = document.getElementById('post-description').value.trim();
          const requirements = document.getElementById('post-requirements').value.trim();
          const schedule = document.getElementById('post-schedule').value.trim();
          const opportunityType = document.getElementById('post-type').value;
          const closesOn = document.getElementById('post-closes').value;
          if (!OfferStore.types[opportunityType] || closesOn < OfferStore.today()) return;

          if (!rawTitle) return;

          const newMission = {
            id: `mis_${Date.now()}`,
            category: cat,
            wilaya: wilaya,
            commune: workMode === 'remote'
              ? { fr: '100 % à distance', en: 'Fully remote', ar: 'عن بُعد بالكامل' }
              : { fr: wilaya, en: wilaya, ar: wilaya },
            isRemote: workMode === 'remote',
            workMode, description, requirements, schedule,
            opportunityType, group: OfferStore.groupFor(opportunityType), closesOn,
            duties: OfferStore.lines(document.getElementById('post-duties').value),
            profile: OfferStore.lines(requirements),
            languages: OfferStore.lines(document.getElementById('post-languages').value),
            qualities: OfferStore.lines(document.getElementById('post-qualities').value),
            conditions: OfferStore.lines(document.getElementById('post-conditions').value),
            payAmount: pay,
            duration: { fr: duration, en: duration, ar: duration },
            employer: { fr: employer, en: employer, ar: employer },
            isUrgent: true,
            featured: true,
            title: { fr: rawTitle, en: rawTitle, ar: rawTitle },
            skills: {
              fr: ['Profil Vérifié MESRS', wilaya],
              en: ['Verified MESRS Profile', wilaya],
              ar: ['طالب موثق MESRS', wilaya]
            }
          };

          newMission.owner = 'demo-recruiter';
          if(window.LiveApp?.enabled){try{await LiveApp.publish(newMission);state.missions=OfferStore.all();}catch(error){showToast(LiveApp.errorText(error));return;}}
          else {if (!OfferStore.add(newMission)) { showToast('Activez le stockage du navigateur pour publier votre offre.'); return; }state.missions.unshift(newMission);}
          window.offerCatalog?.reset();
          state.activeCategory = 'all';
          state.activeWilaya = 'all';
          state.searchQuery = '';
          state.savedOnly = false;
          state.uiState = 'ready';

          closeModal('post-modal');
          postForm.reset();
          document.getElementById('post-wilaya-select').disabled = false;
          renderMissions();
          triggerConfetti();
          showToast('Nouvelle offre publiée en direct !');

          const missionsSec = document.getElementById('missions');
          if (missionsSec) missionsSec.scrollIntoView({ behavior: 'smooth' });
        });
      }

      /* Login Modal Triggers */
      ['login-btn', 'mobile-login-btn'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => openModal('login-modal'));
      });
      document.getElementById('close-login-modal').addEventListener('click', () => closeModal('login-modal'));

      document.getElementById('demo-role-student').addEventListener('click', () => {
        closeModal('login-modal');
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.textContent = '🎓 Yasmine B.';
        showToast('Connectée en tant que Yasmine Belkacem (USTHB)');
      });

      document.getElementById('demo-role-employer').addEventListener('click', () => {
        closeModal('login-modal');
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.textContent = '🏢 Karim T.';
        showToast('Connecté en tant que Karim Touati (InnovDigital)');
      });

      /* Escape Key & Backdrop Click to Close Any Open Modal */
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          ['apply-modal', 'post-modal', 'login-modal'].forEach(closeModal);
        }
      });
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) closeModal(backdrop.id);
        });
      });
    });



window.addEventListener('live-ready',()=>{if(window.jobWorkspace){window.jobWorkspace.state.missions=OfferStore.all();window.jobWorkspace.state.appliedIds=new Set(OfferStore.applied());window.jobWorkspace.renderMissions();}});
window.addEventListener('live-offers',()=>{if(window.jobWorkspace){window.jobWorkspace.state.missions=OfferStore.all();window.jobWorkspace.renderMissions();}});
