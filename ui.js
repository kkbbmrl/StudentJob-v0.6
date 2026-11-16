/* Shared shell and accessible presentation helpers. No data or role logic. */
const footerMarkup = "<footer class=\"site-footer footer-refined\">\n<div class=\"container\">\n  <div class=\"footer-grid\">\n    <div class=\"footer-brand-column\"><a href=\"index.html\" class=\"brand-logo\" aria-label=\"JobEtudiant DZ — Accueil\">\n        <span class=\"brand-logo-mark\" aria-hidden=\"true\">\n          <svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <path d=\"M22 10v6M2 10l10-5 10 5-10 5z\"/>\n            <path d=\"M6 12v5c3 3 9 3 12 0v-5\"/>\n          </svg>\n        </span>\n        <span>JobEtudiant</span>\n        <span class=\"brand-logo-tag\">DZ</span>\n      </a><p>Du premier stage au prochain déclic.<br>Des opportunités pour les étudiants,<br>partout en Algérie.</p><span class=\"footer-location\"><span aria-hidden=\"true\" class=\"footer-location-dot\"></span>Pensé pour les talents d’Algérie</span></div>\n    <nav class=\"footer-col\" aria-label=\"Liens pour les étudiants\"><h2>Étudiants</h2><ul class=\"footer-links\"><li><a href=\"index.html#missions\">Trouver une offre</a></li><li><a href=\"companies.html\">Découvrir les entreprises</a></li><li><a href=\"index.html?workspace=1\">Mon espace étudiant</a></li><li><a href=\"index.html#how-it-works\">Comment ça marche</a></li></ul></nav>\n    <nav class=\"footer-col\" aria-label=\"Liens pour les recruteurs\"><h2>Recruteurs</h2><ul class=\"footer-links\"><li><a href=\"index.html?workspace=1\">Espace recruteur</a></li><li><a href=\"#how-it-works\" id=\"footer-post-link\">Publier une offre</a></li><li><a href=\"index.html#trust\">Confiance & accompagnement</a></li><li><a href=\"index.html#faq\">Questions fréquentes</a></li></ul></nav>\n    <div class=\"footer-col footer-campus-column\"><h2>Pôles universitaires</h2><ul class=\"footer-links\"><li><a href=\"index.html#missions\">Alger · USTHB, ESI</a></li><li><a href=\"index.html#missions\">Oran · USTO</a></li><li><a href=\"index.html#missions\">Constantine & Sétif</a></li><li><a href=\"index.html#missions\">Toutes les opportunités ↗</a></li></ul><p class=\"footer-campus-note\">Sur place, en hybride<br>ou depuis chez vous.</p></div>\n  </div>\n  <div class=\"footer-bottom\"><span>© 2026 JobEtudiant. Tous droits réservés.</span><span class=\"footer-demo-note\">Prototype de démonstration</span><a class=\"footer-back-top\" href=\"index.html\">Retour en haut <span aria-hidden=\"true\">↑</span></a></div>\n</div>\n</footer>";

document.querySelectorAll('[data-shared-footer]').forEach(host => {
  host.outerHTML = footerMarkup.replace(/href="#page-main"/g, 'href="#'+(document.getElementById('main-content') ? 'main-content' : 'page-main')+'"');
});
document.querySelector('.footer-back-top')?.setAttribute('href', '#'+(document.getElementById('main-content') ? 'main-content' : 'page-main'));
document.querySelectorAll('[data-offer-group]').forEach(button => {
  button.removeAttribute('aria-labelledby');
  button.querySelector('strong').id=button.dataset.offerGroup+'-label';
  button.removeAttribute('aria-label');
});
document.querySelectorAll('[role=tablist]').forEach(list => {
  list.addEventListener('keydown',event=>{
    const tabs=[...list.querySelectorAll('[role=tab]')];
    const index=tabs.indexOf(document.activeElement);
    if(index<0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const direction=document.documentElement.dir==='rtl'?-1:1;
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?direction:-direction)+tabs.length)%tabs.length;
    tabs[next].focus();tabs[next].click();
  });
});
document.addEventListener('invalid', event=>{
  const field=event.target;
  if(!field.matches('input,select,textarea'))return;
  field.setAttribute('aria-invalid','true');
  let error=field.nextElementSibling;
  if(!error?.classList.contains('field-error')){
    error=document.createElement('span');error.className='field-error';
    error.id='field-error-'+(++errorCounter);error.setAttribute('role','alert');field.after(error);
    field.dataset.previousDescription=field.getAttribute('aria-describedby')||'';
    field.setAttribute('aria-describedby',[field.dataset.previousDescription,error.id].filter(Boolean).join(' '));
  }
  error.textContent=I18n.validation(field);
},true);
let errorCounter=0;
document.addEventListener('input',event=>{
  const field=event.target;
  if(!field.matches('input,select,textarea') || !field.validity.valid)return;
  field.removeAttribute('aria-invalid');
  if(field.nextElementSibling?.classList.contains('field-error'))field.nextElementSibling.remove();
  if('previousDescription' in field.dataset){
    if(field.dataset.previousDescription)field.setAttribute('aria-describedby',field.dataset.previousDescription);
    else field.removeAttribute('aria-describedby');
    delete field.dataset.previousDescription;
  }
});
function decorateStates(root){
  root.querySelectorAll('.op-empty').forEach(state=>{
    if(state.querySelector('.state-art'))return;
    const art=document.createElement('img');
    art.className='state-art';art.alt='';art.width=176;art.height=128;
    art.src='assets/illustrations/'+(state.querySelector('h1')?'not-found':'empty')+'.svg';
    state.prepend(art);
  });
}
decorateStates(document);
const stateHost=document.querySelector('#companies-content');
if(stateHost)new MutationObserver(()=>decorateStates(stateHost)).observe(stateHost,{childList:true,subtree:true});

// Keep missing offer media in the same frame, including browser-local previews.
document.addEventListener('error',event=>{
 const image=event.target;
 if(!image.matches?.('.mission-media') || image.dataset.recovered)return;
 image.dataset.recovered='true';image.src=image.dataset.fallback;
},true);
if(document.querySelector('.marketplace-header')){
 const links=[...document.querySelectorAll('.marketplace-header .primary-nav a[href^="#"]')];
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;links.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});});},{rootMargin:'-20% 0px -60% 0px'});
 links.forEach(link=>{const section=document.querySelector(link.hash);if(section)observer.observe(section);});
}

const favoriteBadge=document.querySelector('#saved-count-badge');
if(favoriteBadge)new MutationObserver(()=>{
 const button=document.querySelector('#saved-filter-toggle');
 if(window.marketplaceLabels)button.setAttribute('aria-label',window.marketplaceLabels.savedOffers+' '+favoriteBadge.textContent);
}).observe(favoriteBadge,{childList:true,characterData:true,subtree:true});
const closingField=document.querySelector('#closing-filter');
if(closingField)closingField.addEventListener('change',()=>{
 const hint=document.querySelector('#closing-format');
 if(closingField.value)hint.textContent=new Intl.DateTimeFormat(document.documentElement.lang==='en'?'en-GB':document.documentElement.lang+'-DZ',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(closingField.value+'T12:00:00Z'));
 else hint.textContent=window.marketplaceLabels?.dateHint||'';
});

function decorateInterfaceIcons(root=document){
 const tabIcons={overview:'dashboard',applications:'applications',jobs:'briefcase',users:'users',moderation:'admin',profile:'user'};
 const actionIcons={post:'plus',reset:'sliders',browse:'arrow-left',accept:'check',reject:'close',withdraw:'trash',verify:'badge-check',suspend:'shield',pause:'clock',moderate:'admin'};
 root.querySelectorAll('[data-tab],[data-action],#share-offer,#copy-offer,.footer-back-top').forEach(element=>{
  const icon=tabIcons[element.dataset.tab]||actionIcons[element.dataset.action]||(element.id==='share-offer'?'share':element.id==='copy-offer'?'file-text':element.classList.contains('footer-back-top')?'chevron-up':null);
  if(!icon||element.querySelector('.icon'))return;
  element.insertAdjacentHTML('afterbegin',Icon(icon,'sm'));
 });
}
decorateInterfaceIcons();
new MutationObserver(()=>decorateInterfaceIcons()).observe(document.body,{childList:true,subtree:true});
if(location.pathname.endsWith('design-system.html')){
 const section=document.createElement('section');section.className='component-section';
 section.innerHTML='<h2>'+I18n.t("common.copy.iconGallery")+'</h2><div class="icon-gallery">'+Icon.names.map(name=>'<article class="icon-sample"><code data-authored>'+name+'</code><div class="component-row">'+['sm','md','lg'].map(size=>Icon(name,size)).join('')+'</div><span data-authored>16 / 20 / 24</span><small>RTL: '+I18n.text(['arrow-left','arrow-right','chevron-left','chevron-right','external-link','log-in','log-out'].includes(name)?'Oui':'Non')+'</small></article>').join('')+'</div>';
 document.querySelector('main').append(section);I18n.apply(section);
}
