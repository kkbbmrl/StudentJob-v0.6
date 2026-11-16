/* One language lifecycle for static HTML, dynamic views and browser-local previews. */
(() => {
  const dictionaries=window.JobTranslations;
  const supported=['fr','en','ar'];
  let language=supported.includes(document.documentElement.lang)?document.documentElement.lang:'fr';
  const sources=new Map();
  const flatten=(object,prefix='')=>Object.entries(object).flatMap(([key,value])=>typeof value==='object'&&!Array.isArray(value)?flatten(value,prefix+key+'.'):[[prefix+key,value]]);
  flatten(dictionaries.fr).forEach(([key,value])=>{if(typeof value==='string'&&!value.includes('{'))sources.set(value.replace(/\s+/g,' ').trim(),key);});
  const lookup=(lang,key)=>key.split('.').reduce((value,part)=>value?.[part],dictionaries[lang])??dictionaries[lang][key];
  function t(key,parameters={}){
    const value=lookup(language,key)??lookup('fr',key)??key;
    return typeof value==='string'?value.replace(/\{(\w+)\}/g,(_,name)=>String(parameters[name]??'')):value;
  }
  const locale=()=>dictionaries[language].locale;
  const number=value=>new Intl.NumberFormat(locale()).format(value);
  const date=(value,options={dateStyle:'long'})=>new Intl.DateTimeFormat(locale(),{...options,timeZone:'UTC'}).format(new Date(value.length===10?value+'T12:00:00Z':value));
  const currency=value=>new Intl.NumberFormat(locale(),{style:'currency',currency:'DZD',maximumFractionDigits:0}).format(value);
  function plural(key,count){const category=new Intl.PluralRules(locale()).select(count);return t(key+'.'+category,{count:number(count)});}
  function text(source){
    const normalized=String(source).replace(/\s+/g,' ').trim();
    const key=sources.get(normalized);if(key)return t(key);
    let match=normalized.match(/^Bonjour, (.+?)(?: 👋)?$/);if(match)return t('workspace.greeting',{name:match[1]});
    match=normalized.match(/^Espace (étudiant|recruteur|administrateur)$/i);if(match)return t('workspace.space',{role:text(match[1][0].toUpperCase()+match[1].slice(1))});
    match=normalized.match(/^Découvrez (.+)$/);if(match)return t('companies.about',{name:match[1]});
    match=normalized.match(/^Toutes les offres de (.+) →$/);if(match)return t('offers.company',{name:match[1]});
    match=normalized.match(/^Voir les offres \((\d+)\)$/);if(match)return text('Voir les offres')+' ('+number(+match[1])+')';
    return source;
  }
  const textBindings=new WeakMap(),attributeBindings=new WeakMap();
  let applying=false;
  function apply(root=document){
    if(applying)return;applying=true;
    try {
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;
      while(node=walker.nextNode()){
        const parent=node.parentElement;
        if(!parent||parent.closest('script,style,textarea,[data-authored],svg,[contenteditable=true]'))continue;
        const previous=textBindings.get(node);
        const source=previous&&node.nodeValue===previous.last?previous.source:node.nodeValue;
        const translated=text(source);
        textBindings.set(node,{source,last:translated});
        if(node.nodeValue!==translated)node.nodeValue=translated;
      }
      const elements=[...(root instanceof Element?[root]:[]),...root.querySelectorAll('*')];
      elements.forEach(element=>{
        if(element.closest('script,style,[data-authored]'))return;
        if(element.dataset.i18n){const value=t(element.dataset.i18n);if(element.textContent!==value)element.textContent=value;}
        ['placeholder','aria-label','title','data-label'].forEach(attribute=>{
          const explicit=element.getAttribute('data-i18n-'+attribute);
          if(explicit){const value=t(explicit);if(element.getAttribute(attribute)!==value)element.setAttribute(attribute,value);return;}
          if(!element.hasAttribute(attribute))return;
          const bindings=attributeBindings.get(element)||{};
          const old=bindings[attribute],current=element.getAttribute(attribute);
          const source=old&&current===old.last?old.source:current;
          const value=text(source);bindings[attribute]={source,last:value};attributeBindings.set(element,bindings);
          if(current!==value)element.setAttribute(attribute,value);
        });
      });
      document.querySelectorAll('[data-language-switcher]').forEach(switcher=>{
        switcher.setAttribute('aria-label',t('languageLabel'));
        switcher.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
      });
    } finally {applying=false;}
  }
  function switcher(){return '<div class="lang-switcher shared-language-switcher" data-language-switcher role="group" aria-label="'+t('languageLabel')+'">'+supported.map(lang=>'<button type="button" class="lang-btn" data-language="'+lang+'" lang="'+lang+'" aria-pressed="'+(lang===language)+'">'+({fr:'FR',en:'EN',ar:'عربي'}[lang])+'</button>').join('')+'</div>';}
  function mountSwitchers(){
    document.querySelectorAll('.header-actions,.unified-header-inner,.ws-topbar').forEach(host=>{
      if(host.querySelector('[data-language-switcher]'))return;
      const old=host.querySelector('.lang-switcher');
      if(old)old.outerHTML=switcher();else host.insertAdjacentHTML('beforeend',switcher());
    });
  }
  function metadata(){
    const title=document.querySelector('title');
    if(title?.dataset.i18n)title.textContent=t(title.dataset.i18n)+' — JobEtudiant';
    let description=document.querySelector('meta[name=description]');
    if(!description){description=document.createElement('meta');description.name='description';document.head.append(description);}
    description.content=t('heroSubtitle');
  }
  function setLanguage(next){
    if(!supported.includes(next))return;
    language=next;document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';
    try{localStorage.setItem('jobetudiant_lang',JSON.stringify(next));}catch{}
    mountSwitchers();apply();metadata();
    window.dispatchEvent(new CustomEvent('languagechange',{detail:{language:next}}));
  }
  function validation(field){
    const validity=field.validity;
    return validity.valueMissing?t('validation.required'):validity.typeMismatch?t('validation.email'):validity.tooShort?t('validation.short',{min:field.minLength}):t('validation.invalid');
  }
  window.I18n={get language(){return language;},get locale(){return locale();},t,text,apply,setLanguage,switcher,mountSwitchers,number,date,currency,plural,relative:(value,unit='day')=>new Intl.RelativeTimeFormat(locale(),{numeric:'auto'}).format(value,unit),validation,dictionaries};
  window.t=t;
  document.addEventListener('click',event=>{const button=event.target.closest('[data-language]');if(button)setLanguage(button.dataset.language);});
  document.addEventListener('DOMContentLoaded',()=>{
    mountSwitchers();apply();metadata();document.documentElement.classList.remove('i18n-pending');
    const observer=new MutationObserver(()=>{mountSwitchers();apply();});
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  });
})();
