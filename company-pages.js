/* Directory and profile presentation. Filter values and records remain unchanged. */
(() => {
  if(document.body.dataset.page!=='companies')return;
  const store=OfferStore,host=document.querySelector('#companies-content');
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const tr=source=>I18n.text(source);
  const companyUrl=id=>'companies.html?id='+encodeURIComponent(id);
  const available=company=>store.all().filter(offer=>offer.companyId===company.id&&store.isVisible(offer.id)&&!store.isClosed(offer));
  const fact=(icon,label,value)=>`<div class="meta-item company-meta">${Icon(icon)}<div><span class="meta-label">${esc(tr(label))}</span><strong class="meta-value">${esc(value)}</strong></div></div>`;
  // Choose a foreground with at least AA contrast; darken saturated accents if necessary.
  window.companyAccent=color=>{
    const style=getComputedStyle(document.documentElement);
    const dark=style.getPropertyValue('--ink').trim(),light=style.getPropertyValue('--bg').trim();
    const luminance=hex=>{const normalized=hex.length===4?'#'+[...hex.slice(1)].map(c=>c+c).join(''):hex;const rgb=normalized.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
    const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
    let background=/^#[\da-f]{6}$/i.test(color)?color:style.getPropertyValue('--primary').trim();
    if(contrast(background,dark)>=4.5)return {background,foreground:dark};
    while(contrast(background,light)<4.5){background='#'+background.slice(1).match(/.{2}/g).map(channel=>Math.max(0,Math.floor(parseInt(channel,16)*.9)).toString(16).padStart(2,'0')).join('');}
    return {background,foreground:light};
  };
  function avatar(company){
    const colors=companyAccent(company.color);
    return `<span class="company-mark" style="--company-color:${colors.background};--company-foreground:${colors.foreground}" data-authored>${company.logo?`<img src="${esc(company.logo)}" alt="" width="64" height="64" data-company-logo>`:''}<span>${esc(company.initials||company.name.split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</span></span>`;
  }
  function status(company){return `<span class="badge company-status">${Icon(company.verified?'badge-check':'info','sm')}${esc(tr(company.verified?'Vérifié':'Entreprise démo'))}</span>`;}
  const authoredDescription=company=>store.all().some(offer=>offer.owner&&offer.companyDescription&&offer.companyDescription===company.description);
  const description=company=>authoredDescription(company)?company.description:tr(company.description);
  function card(company){return `<article class="company-card"><div class="company-card-heading">${avatar(company)}<div><h2 data-authored>${esc(company.name)}</h2><span class="badge sector-badge">${esc(tr(company.sector))}</span></div></div>${status(company)}<p class="company-description" ${authoredDescription(company)?'data-authored':''}>${esc(description(company))}</p><div class="company-facts">${fact('map-pin','Localisation',company.location)}${fact('briefcase','Offres ouvertes',I18n.number(available(company).length))}${fact('users','Effectif',tr(company.size))}</div><div class="company-actions"><a class="btn btn-primary" href="${companyUrl(company.id)}">${esc(I18n.t("common.copy.viewCompany"))}${Icon('arrow-right','sm')}</a></div></article>`;}
  function empty(){return `<div class="op-empty"><img class="state-art" src="assets/illustrations/empty.svg" width="176" height="128" alt=""><h2>${esc(I18n.t("common.copy.noCompaniesFound"))}</h2><p>${esc(I18n.t("common.copy.changeYourSearchOrResetTheFilters"))}</p><button class="btn btn-secondary" type="button" data-reset-companies>${esc(I18n.t('btnReset'))}</button></div>`;}
  function profile(company){
    const offers=available(company);
    document.title=company.name+' — JobEtudiant';
    host.innerHTML=`<nav class="op-breadcrumb" aria-label="${esc(I18n.t("common.copy.breadcrumb"))}"><a href="companies.html">${esc(I18n.t('navCompanies'))}</a><span>/</span><span data-authored>${esc(company.name)}</span></nav><header class="company-profile-hero">${avatar(company)}<div><h1 data-authored>${esc(company.name)}</h1>${status(company)}<p>${Icon('map-pin')}${esc(company.location)}</p>${company.website?`<a class="op-text-link" href="${esc(company.website)}" rel="noopener noreferrer">${Icon('globe')}${esc(I18n.t("common.copy.website"))}${Icon('external-link','sm')}</a>`:''}</div></header><div class="company-profile-facts">${fact('briefcase','Offres ouvertes',I18n.number(offers.length))}${fact('users','Effectif',tr(company.size))}${fact('map-pin','Localisation',company.location)}${fact('building','Secteur',tr(company.sector))}${fact('calendar','Année de création',company.founded||I18n.t("common.copy.notProvided"))}</div><article class="op-description company-about"><h2>${esc(I18n.t("common.copy.about"))}</h2><p ${authoredDescription(company)?'data-authored':''}>${esc(description(company))}</p><h2>${esc(I18n.t("common.copy.whyJoinUs"))}</h2><ul>${(company.benefits||[]).map(value=>`<li>${esc(tr(value))}</li>`).join('')}</ul></article><section class="company-offers-section"><h2 id="company-offers-title">${esc(I18n.t("common.copy.ourOpenOffers"))}</h2><p role="status">${esc(I18n.plural('offers.count',offers.length))}</p><div class="company-offer-grid" id="company-offers">${offers.length?offers.map((offer,index)=>OfferCard(offer,{index,applied:store.applied().includes(offer.id)})).join(''):`<div class="op-empty"><img class="state-art" src="assets/illustrations/empty.svg" width="176" height="128" alt=""><p>${esc(I18n.t("common.copy.noOpenOffersAtTheMoment"))}</p><a class="btn btn-secondary" href="companies.html">${esc(I18n.t("common.copy.exploreMoreCompanies"))}</a></div>`}</div></section>`;
  }
  const filters={query:'',city:'',sector:'',sort:'name'};
  let renderGrid;
  function render(){
    try {
      const companies=store.companies(),id=new URLSearchParams(location.search).get('id');
      if(id){const company=companies.find(item=>item.id===id);if(company)profile(company);else host.innerHTML=`<div class="op-empty"><h1>${esc(I18n.t("common.copy.companyNotFound"))}</h1><p>${esc(I18n.t("common.copy.thisOfferOrCompanyIsUnavailableExploreCurrent"))}</p><a class="btn btn-primary" href="companies.html">${esc(I18n.t('navCompanies'))}</a></div>`;return;}
      document.title=I18n.t('navCompanies')+' — JobEtudiant';
      const options=(values,current,all)=>`<option value="">${esc(tr(all))}</option>`+values.map(value=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(tr(value))}</option>`).join('');
      host.innerHTML=`<header class="directory-heading"><div><span class="op-kicker">${esc(I18n.t("common.copy.theJobetudiantNetwork"))}</span><h1>${esc(I18n.t('companies.directory.title'))}</h1><p>${esc(I18n.t("common.copy.teamsCareersAndOpportunitiesToBuildYourFuture"))}</p></div></header><form class="company-filters" id="company-filters"><label for="company-name">${esc(I18n.t("common.copy.companyName"))}<input class="input-field" id="company-name" type="search" value="${esc(filters.query)}" placeholder="${esc(I18n.t("common.copy.nameOrSector"))}"></label><label for="company-location">${esc(I18n.t('locationLabel'))}<select class="input-field" id="company-location">${options([...new Set(companies.map(item=>item.location))],filters.city,'Toutes les villes')}</select></label><label for="company-sector">${esc(I18n.t("common.copy.sector"))}<select class="input-field" id="company-sector">${options([...new Set(companies.map(item=>item.sector))],filters.sector,'Tous les secteurs')}</select></label><label for="company-sort">${esc(I18n.t('sortLabel'))}<select class="input-field" id="company-sort"><option value="name" ${filters.sort==='name'?'selected':''}>${esc(I18n.t("common.copy.nameAZ"))}</option><option value="offers" ${filters.sort==='offers'?'selected':''}>${esc(I18n.t("common.copy.openOffers"))}</option></select></label><button class="btn btn-secondary company-reset" type="reset">${Icon('sliders','sm')}${esc(I18n.t('btnReset'))}</button></form><p id="company-count" class="company-result-count" role="status"></p><div class="company-grid" id="company-grid"></div>`;
      renderGrid=()=>{
        const query=filters.query.toLocaleLowerCase(I18n.locale).trim();
        const matches=companies.filter(company=>(company.name+' '+tr(company.sector)).toLocaleLowerCase(I18n.locale).includes(query)&&(!filters.city||company.location===filters.city)&&(!filters.sector||company.sector===filters.sector));
        matches.sort((a,b)=>filters.sort==='offers'?available(b).length-available(a).length||a.name.localeCompare(b.name,I18n.locale):a.name.localeCompare(b.name,I18n.locale));
        document.querySelector('#company-count').textContent=I18n.plural('companies.count',matches.length);
        document.querySelector('#company-grid').innerHTML=matches.length?matches.map(card).join(''):empty();
      };
      const form=document.querySelector('#company-filters');
      form.addEventListener('input',()=>{filters.query=form.querySelector('#company-name').value;filters.city=form.querySelector('#company-location').value;filters.sector=form.querySelector('#company-sector').value;filters.sort=form.querySelector('#company-sort').value;renderGrid();});
      form.addEventListener('submit',event=>event.preventDefault());
      form.addEventListener('reset',()=>{Object.assign(filters,{query:'',city:'',sector:'',sort:'name'});queueMicrotask(render);});
      renderGrid();
    }catch(error){console.error(error);host.innerHTML=`<div class="op-empty" role="alert">${Icon('error','lg')}<h1>${esc(I18n.t('common.error'))}</h1><button type="button" class="btn btn-primary" data-retry-companies>${esc(I18n.t('common.retry'))}</button></div>`;}
    I18n.apply(host);
  }
  host.innerHTML='<div class="ui-skeleton-card" role="status" aria-label="'+esc(I18n.t("common.copy.loadingContent"))+'"><span></span><span></span><span></span></div>';
  host.addEventListener('click',event=>{if(event.target.closest('[data-reset-companies]'))document.querySelector('#company-filters').reset();if(event.target.closest('[data-retry-companies]'))render();});
  document.addEventListener('error',event=>{if(event.target.matches?.('[data-company-logo]'))event.target.hidden=true;},true);
  window.addEventListener('languagechange',render);
  render();
})();
