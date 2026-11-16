/* Full-page offer and company views. */
(() => {
  const store=OfferStore;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const offerUrl=id=>'offer.html?id='+encodeURIComponent(id);
  const companyUrl=id=>'companies.html?id='+encodeURIComponent(id);
  const params=new URLSearchParams(location.search);
  const mode=m=>m.workMode==='hybrid'?'Hybride':m.isRemote?'Télétravail':'Sur place';
  const place=m=>m.isRemote?'100 % à distance':m.wilaya;
  const list=items=>`<ul>${store.lines(items).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const fact=(label,value,icon)=>`<div class="offer-fact">${Icon(icon||'info')}<div><span data-i18n="${label}">${I18n.t(label)}</span><strong>${esc(value)}</strong></div></div>`;
  const initials=c=>`<span class="company-mark" data-authored>${esc(c.initials)}</span>`;
  function unavailable(host,message){host.innerHTML=`<div class="op-empty"><h1>${message}</h1><p>${I18n.t("common.copy.thisOfferOrCompanyIsUnavailableExploreCurrent")}</p><a class="btn btn-primary" href="index.html#missions">${I18n.t("common.copy.viewOffersMessage45")}</a></div>`;}
  function offerPage(){
    const host=document.getElementById('offer-content');const m=store.get(params.get('id'));
    if(!m||!store.isVisible(m.id)){unavailable(host,'Offre indisponible');return;}
    document.title=(m.owner?store.local(m.title):I18n.dictionaries[I18n.language].offerTitles[m.id]||store.local(m.title))+' — JobEtudiant';
    const c=store.companies().find(c=>c.id===m.companyId);
    const closed=store.isClosed(m),applied=store.applied().includes(m.id);
    const conditions=[...store.lines(m.conditions)];
    if(!conditions.length)conditions.push('Type : '+store.types[m.opportunityType]+'.','Durée : '+store.local(m.duration)+'.','Environnement : '+mode(m)+'.');
    if(m.schedule)conditions.push(m.schedule);
    const sections=[['Duties & Responsibilities','Tâches & responsabilités',m.duties||m.description],['Required Profile','Profil recherché',m.profile||m.requirements||store.local(m.skills)],['Language Skills','Compétences linguistiques',m.languages||['À préciser avec le recruteur.']],['Required Qualities','Qualités requises',m.qualities||['Motivation et respect des engagements.']],['Working Conditions','Conditions de travail',conditions]];
    const categoryIcon={tutoring:'tutoring',events:'events',design:'design',writing:'translation',tech:'tech-data',retail:'retail',delivery:'delivery'}[m.category]||'briefcase';
    const sectionIcons=['applications','student','globe','badge-check','briefcase'];
    const compensation=m.compensation||(m.payAmount?I18n.currency(m.payAmount):I18n.t('common.copy.freeUnpaid'));
    host.innerHTML=`
      <nav class="op-breadcrumb offer-breadcrumb" aria-label="${I18n.text('Fil d’Ariane')}"><a href="index.html#missions">${Icon('arrow-left','sm')}${I18n.t('navMissions')}</a><span aria-hidden="true">/</span><span>${esc(I18n.t('types.'+m.opportunityType))}</span></nav>
      <header class="op-offer-hero offer-dossier">
        <div class="offer-hero-copy">
          <div class="offer-heading-tags"><span class="badge offer-category">${Icon(categoryIcon,'sm')}${esc(I18n.text(store.groups[m.group]))}</span><span class="badge offer-contract">${Icon('file-text','sm')}${esc(I18n.t('types.'+m.opportunityType))}</span></div>
          <h1>${esc(store.local(m.title))}</h1>
          <a class="op-company-line" href="${companyUrl(c.id)}">${initials(c)}<span><strong data-authored>${esc(c.name)}</strong><small>${I18n.t('interface.copy.discoverTheCompany').replace(/\s*[↗→←]$/,'')}${Icon('external-link','sm')}</small></span></a>
        </div>
        <div class="offer-hero-symbol" aria-hidden="true">${Icon(categoryIcon,'lg')}</div>
        <div class="op-key-facts">${fact('locationLabel',place(m),'map-pin')}${fact('interface.copy.closingDate',store.date(m.closesOn),'calendar')}${fact('typeLabel',I18n.t('types.'+m.opportunityType),'briefcase')}</div>
      </header>
      <div class="op-detail-layout offer-reading-layout">
        <article class="op-description offer-description">
          <div class="offer-description-intro"><h2>${Icon('info','lg')}${I18n.t('common.copy.aboutThisOffer')}</h2><p class="op-intro">${esc(m.description)}</p></div>
          ${sections.map(([en,fr,items],index)=>`<section aria-label="${I18n.text(fr)}" data-i18n-aria-label="${I18n.keyFor(fr)}"><h2><span class="offer-section-icon">${Icon(sectionIcons[index])}</span><span>${I18n.text(fr)}</span></h2>${list(items)}</section>`).join('')}
          <div class="op-demo-note">${Icon('info','sm')}<span>${I18n.t('common.copy.fictionalOfferAndConditionsForThisPrototype')}</span></div>
        </article>
        <aside class="op-apply-card offer-action-panel">
          <div class="offer-compensation"><span>${Icon('banknote')}${I18n.text('Rémunération / accès')}</span><strong ${m.owner?'data-authored':''}>${esc(compensation)}</strong></div>
          <div class="offer-action-heading"><span class="op-kicker">${I18n.t('common.copy.yourNextStep')}</span><h2>${I18n.text(closed?'Les candidatures sont closes.':'Cette offre vous intéresse ?')}</h2><p>${I18n.t('common.copy.reviewTheConditionsAndPrepareYourApplication')}</p></div>
          <div class="op-summary">${fact('common.copy.duration',store.local(m.duration),'hourglass')}${fact('common.copy.workEnvironment',mode(m),m.isRemote?'laptop':'building')}</div>
          <div class="offer-primary-actions"><button class="btn btn-primary" id="offer-apply" ${closed||applied?'disabled':''}>${Icon(applied?'check':'applications','sm')}<span>${I18n.text(closed?'Offre clôturée':applied?'Candidature envoyée':'Postuler à cette offre')}</span></button><button class="btn btn-secondary" id="share-offer">${Icon('share','sm')}<span>${I18n.t('common.copy.shareOffer')}</span></button></div>
          <div id="share-panel" hidden><label for="share-url">${I18n.t('common.copy.offerLink')}</label><input class="input-field" id="share-url" readonly><button class="op-text-button" id="copy-offer">${Icon('file-text','sm')}${I18n.t('common.copy.copyLink')}</button><p class="op-small" id="share-help"></p></div>
          <p id="offer-status" role="status" class="op-status"></p><a class="op-text-link offer-company-link" href="${companyUrl(c.id)}">${Icon('building','sm')}<span>${I18n.t('offers.company',{name:c.name})}</span></a>
        </aside>
      </div>
      <section class="op-application" id="application-section" hidden><div class="offer-application-heading"><span class="offer-section-icon">${Icon('applications','lg')}</span><div><h2>${I18n.t('common.copy.yourApplication')}</h2><p>${I18n.t('common.copy.thisApplicationIsSavedInYourDemoStudent')}</p></div></div><form id="offer-application"><label>${I18n.t('common.copy.fullName')}<input class="input-field" name="name" required maxlength="150"></label><label>${I18n.t('common.copy.emailAddress')}<input class="input-field" name="email" type="email" required maxlength="180"></label><label class="op-full">${I18n.t('common.copy.applicationMessage')}<textarea class="input-field" name="message" rows="5" required minlength="10" maxlength="2000"></textarea></label><div class="op-full offer-form-actions"><button class="btn btn-primary" type="submit">${Icon('check','sm')}${I18n.t('common.copy.submitMyApplication')}</button><button class="btn btn-secondary" id="cancel-application" type="button">${I18n.t('common.copy.cancel')}</button></div></form></section>`;
    if(window.LiveApp?.enabled){const info=host.querySelector('.op-application>div p');if(info)info.textContent=I18n.t('live.applicationIntro');}
    if(m.owner){host.querySelectorAll('.op-description p,.op-description li,.op-offer-hero h1').forEach(el=>el.setAttribute('data-authored',''));}
    const apply=document.getElementById('offer-apply'),form=document.getElementById('offer-application'),section=document.getElementById('application-section');
    apply.onclick=()=>{if(window.LiveApp?.enabled&&LiveApp.user?.role!=='student'){LiveApp.open();return;}if(window.LiveApp?.enabled&&m.recruiterAvailable===false){document.getElementById('offer-status').textContent=I18n.t('live.errors.recipient_unavailable');return;}const profile=window.LiveApp?.enabled?LiveApp.user:store.read('jobetudiant_workspace',null)?.profiles?.student;form.elements.name.value=profile?.name||'Yasmine Belkacem';form.elements.email.value=profile?.email||'yasmine@example.com';if(window.LiveApp?.enabled){form.elements.name.readOnly=true;form.elements.email.readOnly=true;}section.hidden=false;section.scrollIntoView({behavior:'smooth',block:'start'});form.elements.message.focus({preventScroll:true});};
    document.getElementById('cancel-application').onclick=()=>{section.hidden=true;apply.focus();};
    form.onsubmit=async event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const submit=form.querySelector('[type=submit]');const status=document.getElementById('offer-status');
      submit.disabled=true;submit.setAttribute('aria-busy','true');status.textContent=I18n.t('live.sending');status.dataset.error='false';
      try{
        if(window.LiveApp?.enabled)await LiveApp.apply(m.id,form.elements.message.value.trim());
        else if(!store.apply(m.id,form.elements.message.value.trim(),{name:form.elements.name.value.trim(),email:form.elements.email.value.trim()}))throw new Error('storage_unavailable');
        section.hidden=true;apply.disabled=true;apply.innerHTML=Icon('check','sm')+'<span>'+I18n.t('common.copy.applicationSent')+'</span>';
        status.textContent=window.LiveApp?.enabled?I18n.t('live.sent'):I18n.t('live.demoSent');
        apply.scrollIntoView({behavior:'smooth',block:'center'});
      }catch(error){status.dataset.error='true';status.textContent=window.LiveApp?.enabled?LiveApp.errorText(error):I18n.t('common.copy.unableToSaveCheckBrowserStorageAndOffer');}
      finally{submit.disabled=false;submit.removeAttribute('aria-busy');}
    };
    const shareInput=document.getElementById('share-url');shareInput.value=location.href;
    document.getElementById('share-offer').onclick=()=>{document.getElementById('share-panel').hidden=false;document.getElementById('share-help').textContent=location.protocol==='file:'?'Lien local : hébergez le prototype pour partager une URL publique.':m.owner?'Cette offre de démonstration est enregistrée uniquement dans ce navigateur.':'Partagez ce lien pour ouvrir directement l’offre.';shareInput.focus();shareInput.select();};
    document.getElementById('copy-offer').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.getElementById('offer-status').textContent=I18n.t("common.copy.linkCopied");}catch{shareInput.focus();shareInput.select();document.getElementById('offer-status').textContent=I18n.t("common.copy.selectTheLinkAndCopyItWithCtrl");}};
  }
  if(document.body.dataset.page==='offer'){offerPage();window.addEventListener('live-ready',offerPage);window.addEventListener('live-session',()=>{const current=store.get(params.get('id'));const button=document.querySelector('#offer-apply');if(button&&current)button.disabled=store.isClosed(current)||store.applied().includes(current.id);});window.addEventListener('languagechange',()=>{const m=store.get(params.get('id'));if(!m)return;document.title=(m.owner?store.local(m.title):(I18n.dictionaries[I18n.language].offerTitles[m.id]||store.local(m.title)))+' — JobEtudiant';const facts=document.querySelectorAll('.op-key-facts strong');if(facts[1])facts[1].textContent=I18n.date(m.closesOn);const pay=document.querySelector('.offer-compensation>strong');if(pay)pay.textContent=m.compensation?(m.owner?m.compensation:I18n.text(m.compensation)):(m.payAmount?I18n.currency(m.payAmount):I18n.t('common.copy.freeUnpaid'));const company=store.companies().find(c=>c.id===m.companyId);const link=document.querySelector('.offer-company-link span');if(link&&company)link.textContent=I18n.t('offers.company',{name:company.name});});}
})();
