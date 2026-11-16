/* Shared by the homepage catalog and company profiles. No application state mutations. */
window.OfferCard=(offer,{index=0,saved=false,applied=false,saveButton=false}={})=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dict=I18n.dictionaries[I18n.language];
  const title=offer.owner?OfferStore.local(offer.title):dict.offerTitles?.[offer.id]||OfferStore.local(offer.title);
  const category=dict[{tutoring:'catTutoring',events:'catEvents',design:'catDesign',writing:'catWriting',tech:'catTech',retail:'catRetail',delivery:'catDelivery'}[offer.category]];
  const fallback='assets/illustrations/offer-'+(['tutoring','events','design','writing','tech','retail','delivery'].includes(offer.category)?offer.category:'tech')+'.svg';
  const url='offer.html?id='+encodeURIComponent(offer.id);
  const skillList=OfferStore.local(offer.skills)||[];
  return `<article class="mission-card" data-mission-id="${esc(offer.id)}">
    <img class="mission-media" src="${esc(offer.image||fallback)}" data-fallback="${fallback}" width="640" height="400" loading="${index<3?'eager':'lazy'}" alt="${esc(category+' — '+title)}">
    <div class="card-top-bar"><div class="card-badges"><span class="badge">${Icon({tutoring:'tutoring',events:'events',design:'design',writing:'translation',tech:'tech-data',retail:'retail',delivery:'delivery'}[offer.category]||'tag','sm')}${esc(category)}</span>${offer.isUrgent?`<span class="badge status-error">${esc(dict.urgentBadge)}</span>`:''}${offer.isRemote?`<span class="badge">${Icon('laptop','sm')}${esc(dict.remoteBadge)}</span>`:''}</div>${saveButton?`<button class="heart-btn" type="button" data-action="toggle-save" data-id="${esc(offer.id)}" aria-pressed="${saved}" aria-label="${esc(dict.saveOffer+' '+title)}">${Icon('heart','sm')}</button>`:''}</div>
    <h3 class="mission-title"><a class="mission-detail-link" href="${url}" ${offer.owner?'data-authored':''}>${esc(title)}</a></h3>
    <p class="mission-employer" data-authored>${esc(offer.employer?.fr||offer.employer)}</p>
    <div class="offer-card-facts"><span>${esc(I18n.t('types.'+offer.opportunityType))}</span><span>${Icon('calendar','sm')}${esc(dict.deadline)}: ${esc(I18n.date(offer.closesOn,{day:'2-digit',month:'2-digit',year:'numeric'}))}</span></div>
    <div class="mission-meta-grid"><div class="meta-item">${Icon('map-pin')}<span ${offer.owner?'data-authored':''}>${esc(offer.isRemote?dict.remoteOnly:OfferStore.local(offer.commune)||offer.wilaya)}</span></div><div class="meta-item">${Icon('clock')}<span ${offer.owner?'data-authored':''}>${esc(OfferStore.local(offer.duration))}</span></div><div class="pay-tag"><span class="pay-amount">${esc(offer.payAmount?I18n.currency(offer.payAmount):dict.free)}</span><span class="pay-sub">${esc(offer.payAmount?dict.demoPay:dict.studentAccess)}</span></div></div>
    <div class="offer-skills">${(Array.isArray(skillList)?skillList:[]).map(skill=>`<span class="badge" ${offer.owner?'data-authored':''}>${esc(skill)}</span>`).join('')}</div>
    <div class="mission-footer"><a class="btn btn-primary" href="${url}" data-id="${esc(offer.id)}">${esc(OfferStore.isClosed(offer)?dict.closedOffer:applied?dict.appliedBtn:dict.viewOffer)}${Icon('arrow-right','sm')}</a></div>
  </article>`;
};
