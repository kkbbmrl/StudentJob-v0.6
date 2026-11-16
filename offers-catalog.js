document.addEventListener('DOMContentLoaded',()=>{
  const api=window.jobWorkspace,store=OfferStore;
  let group='all',type='all',closing='';
  const typeFilter=document.getElementById('opportunity-filter');
  function options(select,family,all=false){select.replaceChildren();if(all)select.add(new Option(window.marketplaceLabels?.allTypes || 'Tous les types','all'));Object.entries(store.types).filter(([key])=>family==='all'||store.groupFor(key)===family).forEach(([key,label])=>select.add(new Option(window.marketplaceLabels?.types[key] || label,key)));}
  options(typeFilter,'all',true);
  document.querySelectorAll('[data-offer-group]').forEach(button=>{
    button.addEventListener('click',()=>{
      group=group===button.dataset.offerGroup?'all':button.dataset.offerGroup;type='all';
      document.querySelectorAll('[data-offer-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.offerGroup===group)));
      options(typeFilter,group,true);api.state.activeCategory='all';api.state.uiState='ready';
      document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.category==='all')));
      api.renderMissions();
    });
  });
  typeFilter.onchange=()=>{type=typeFilter.value;api.renderMissions();};
  document.getElementById('closing-filter').onchange=e=>{closing=e.target.value;api.renderMissions();};
  window.offerCatalog={matches:m=>(group==='all'||m.group===group)&&(type==='all'||m.opportunityType===type)&&(!closing||m.closesOn>=closing),reset:()=>{group='all';type='all';closing='';options(typeFilter,'all',true);document.getElementById('closing-filter').value='';document.querySelectorAll('[data-offer-group]').forEach(b=>b.setAttribute('aria-pressed','false'));}};
  const family=document.getElementById('post-group'),postType=document.getElementById('post-type'),form=document.getElementById('post-mission-form'),closes=document.getElementById('post-closes');
  function setup(){options(postType,family.value);closes.min=store.today();const end=new Date();end.setDate(end.getDate()+30);closes.value=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Algiers',year:'numeric',month:'2-digit',day:'2-digit'}).format(end);}
  family.onchange=()=>options(postType,family.value);setup();
  form.addEventListener('reset',()=>setTimeout(setup,0));
  document.getElementById('post-template').onclick=()=>{
    const m=store.get('offer-internship');family.value='development';options(postType,'development');postType.value='internship';
    const fields={'post-title-input':store.local(m.title),'post-mode':'hybrid','post-description':m.description,'post-requirements':m.profile.join('\n'),'post-duties':m.duties.join('\n'),'post-languages':m.languages.join('\n'),'post-qualities':m.qualities.join('\n'),'post-conditions':m.conditions.join('\n'),'post-duration-input':'6 mois','post-employer-input':'InnovDigital','post-pay-input':'18000'};
    Object.entries(fields).forEach(([id,value])=>{const field=document.getElementById(id);field.value=value;field.setCustomValidity('');});
    document.getElementById('post-wilaya-select').disabled=false;
  };
  // Keep whitespace-only bullet fields from creating empty detail sections.
  ['post-description','post-requirements','post-duties','post-languages','post-qualities','post-conditions'].forEach(id=>{
    const field=document.getElementById(id);field.addEventListener('input',()=>field.setCustomValidity(store.lines(field.value).length?'':'Ajoutez au moins un point.'));
  });
  window.addEventListener('pageshow',event=>{if(event.persisted){api.state.missions=store.all();api.state.appliedIds=new Set(store.applied());api.renderMissions();}});
});
