/* Same-origin server transport and account/inbox UI. File previews retain demo mode. */
(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const tr=key=>I18n.t('live.'+key);
  const state={enabled:Boolean(document.querySelector('meta[name=studentjob-live]')),user:null,offers:[],applications:[],tab:'applications',authMode:'login',open:false};
  let host=null,returnFocus=null,pollTimer=null,refreshing=false;
  const previousInert=new Map();
  /** Requests include the same-origin guard; a failed write never becomes a success state. */
  async function request(path,{method='GET',body,signal}={}){
    const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-Requested-With':'StudentJob'},body:body===undefined?undefined:JSON.stringify(body),signal});
    let data;try{data=await response.json();}catch{throw new Error('server_unavailable');}
    if(!response.ok)throw new Error(data.error??'server_error');return data;
  }
  function errorText(error){const key='live.errors.'+error.message;const translated=I18n.t(key);return translated===key?tr('errors.server_unavailable'):translated;}
  function feedback(message,error=false){const target=host?.querySelector('#live-feedback');if(target){target.textContent=message;target.classList.toggle('field-error',error);}}
  function setRole(){
    document.documentElement.dataset.demoRole=state.user?.role??'student';
    ['header-post-btn','mobile-post-btn','hero-post-btn','final-post-btn','footer-post-link'].forEach(id=>{const button=document.getElementById(id);if(button)button.hidden=state.user?.role!=='recruiter';});
    const demo=document.querySelector('.workspace-launcher');if(demo)demo.hidden=true;
    const login=document.getElementById('login-btn');if(login){login.removeAttribute('data-i18n');login.innerHTML=esc(tr(state.user?'account':'login'))+(state.user?.role==='recruiter'?'<span class="badge" data-live-unread hidden></span>':'');}
  }
  async function refreshApplications(){
    if(!state.user||refreshing)return;
    refreshing=true;
    try{
      const data=await request('/api/applications');
      const changed=JSON.stringify(state.applications)!==JSON.stringify(data.applications);
      state.applications=data.applications;
      document.querySelectorAll('[data-live-unread]').forEach(node=>{node.textContent=I18n.number(data.unreadCount);node.hidden=!data.unreadCount;});
      if(changed&&state.open&&state.tab==='applications')renderApplications();
    }catch(error){if(state.open)feedback(errorText(error),true);}
    finally{refreshing=false;}
  }
  function schedulePoll(){
    clearTimeout(pollTimer);
    if(!state.user||document.hidden)return;
    pollTimer=setTimeout(async()=>{await refreshApplications();schedulePoll();},4000);
  }
  function auth(){return `<div class="live-auth ws-card"><h2>${esc(tr(state.authMode==='login'?'login':'register'))}</h2><p class="ws-sub">${esc(tr('authIntro'))}</p><form id="live-auth-form">${state.authMode==='register'?`<label>${esc(tr('name'))}<input class="input-field" name="name" autocomplete="name" required minlength="2" maxlength="150"></label><label>${esc(tr('role'))}<select class="input-field" name="role"><option value="student">${esc(tr('student'))}</option><option value="recruiter">${esc(tr('recruiter'))}</option></select></label><div class="live-recruiter-fields" hidden><label>${esc(tr('company'))}<input class="input-field" name="company" maxlength="150" autocomplete="organization"></label><label>${esc(tr('invitation'))}<input class="input-field" name="invitation" autocomplete="off"><small>${esc(tr('invitationHint'))}</small></label></div>`:''}<label>${esc(tr('email'))}<input class="input-field" name="email" type="email" autocomplete="email" required maxlength="180"></label><label>${esc(tr('password'))}<input class="input-field" name="password" type="password" autocomplete="${state.authMode==='register'?'new-password':'current-password'}" required minlength="10" maxlength="128"></label><button class="btn btn-primary" type="submit">${esc(tr(state.authMode==='login'?'login':'register'))}</button></form><button class="op-text-button" type="button" data-live-action="auth-mode">${esc(tr(state.authMode==='login'?'createAccount':'haveAccount'))}</button></div>`;}
  function offerForm(){return `<div class="ws-card"><h2>${esc(tr('publish'))}</h2><form id="live-offer-form"><label>${esc(tr('offerTitle'))}<input class="input-field" name="title" required minlength="3" maxlength="150"></label><label>${esc(tr('description'))}<textarea class="input-field" name="description" required minlength="10" maxlength="5000" rows="5"></textarea></label><div class="ws-form-grid"><label>${esc(tr('type'))}<select class="input-field" name="opportunityType">${Object.entries(I18n.dictionaries[I18n.language].types).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select></label><label>${esc(tr('category'))}<select class="input-field" name="category">${[['tech','catTech'],['tutoring','catTutoring'],['events','catEvents'],['design','catDesign'],['writing','catWriting'],['retail','catRetail'],['delivery','catDelivery']].map(([id,key])=>`<option value="${id}">${esc(I18n.t(key))}</option>`).join('')}</select></label><label>${esc(tr('location'))}<input class="input-field" name="wilaya" required maxlength="100"></label><label>${esc(tr('workMode'))}<select class="input-field" name="workMode"><option value="onsite">${esc(tr('onsite'))}</option><option value="hybrid">${esc(tr('hybrid'))}</option><option value="remote">${esc(tr('remote'))}</option></select></label><label>${esc(tr('deadline'))}<input class="input-field" name="closesOn" type="date" min="${new Date().toISOString().slice(0,10)}" required></label><label>${esc(tr('duration'))}<input class="input-field" name="duration" required maxlength="160"></label><label>${esc(tr('pay'))}<input class="input-field" name="payAmount" type="number" min="0" max="100000000" value="0" required></label></div><button class="btn btn-primary" type="submit">${esc(tr('publish'))}</button></form></div>`;}
  function render(){
    if(!host)return;
    const user=state.user;
    host.innerHTML=`<div class="live-window"><header class="live-topbar"><a class="brand-logo" href="index.html">JobEtudiant</a><div class="live-topbar-actions">${I18n.switcher()}<button type="button" class="btn btn-ghost" data-live-action="close" aria-label="${esc(tr('close'))}">${Icon('close')}</button></div></header><main class="live-body"><div class="ws-page-heading"><div><h1>${esc(tr(user?'account':'login'))}</h1><p class="ws-sub" ${user?'data-authored':''}>${esc(user?user.name+(user.company?' · '+user.company:''):tr('serverIntro'))}</p></div>${user?`<button class="btn btn-secondary" type="button" data-live-action="logout">${Icon('log-out','sm')}${esc(tr('logout'))}</button>`:''}</div>${user?`<nav class="live-tabs" aria-label="${esc(tr('navigation'))}"><button class="btn ${state.tab==='applications'?'btn-primary':'btn-secondary'}" data-live-tab="applications">${Icon('applications','sm')}${esc(tr(user.role==='recruiter'?'inbox':'myApplications'))}<span class="badge" data-live-unread hidden></span></button>${user.role==='recruiter'?`<button class="btn ${state.tab==='offers'?'btn-primary':'btn-secondary'}" data-live-tab="offers">${Icon('briefcase','sm')}${esc(tr('myOffers'))}</button><button class="btn ${state.tab==='publish'?'btn-primary':'btn-secondary'}" data-live-tab="publish">${Icon('plus','sm')}${esc(tr('publish'))}</button>`:''}</nav><div id="live-content"></div>`:auth()}<p id="live-feedback" role="status" class="ws-footnote"></p></main></div>`;
    if(user){
      if(state.tab==='applications')renderApplications();
      else if(state.tab==='publish')host.querySelector('#live-content').innerHTML=offerForm();
      else host.querySelector('#live-content').innerHTML=`<div class="company-offer-grid">${state.offers.filter(offer=>offer.owner===user.id).map((offer,index)=>OfferCard(offer,{index})).join('')||`<div class="op-empty"><p>${esc(tr('noOffers'))}</p></div>`}</div>`;
    }
  }
  function renderApplications(){
    const content=host?.querySelector('#live-content');if(!content||state.tab!=='applications')return;
    const opened=new Set([...content.querySelectorAll('details[open]')].map(element=>element.dataset.messageId));
    const recruiter=state.user?.role==='recruiter';
    content.innerHTML=state.applications.length?`<div class="live-applications">${state.applications.map(app=>`<article class="ws-card live-application ${!app.readAt&&recruiter?'is-unread':''}" data-application-id="${esc(app.id)}"><div class="live-application-heading"><div><h2><a href="offer.html?id=${encodeURIComponent(app.offerId)}" data-authored>${esc(app.offerTitle)}</a></h2><p class="ws-sub" data-authored>${esc(app.company)}</p></div><span class="ws-badge">${esc(tr('status.'+app.status))}</span></div><div class="live-application-meta"><span data-authored>${Icon('user','sm')}${esc(app.name)}</span>${recruiter?`<a href="mailto:${encodeURIComponent(app.email)}" data-authored>${Icon('mail','sm')}${esc(app.email)}</a>`:''}<time datetime="${esc(app.createdAt)}">${Icon('calendar','sm')}${esc(I18n.date(app.createdAt,{dateStyle:'medium',timeStyle:'short'}))}</time></div><details class="live-message" data-message-id="${esc(app.id)}" ${opened.has(app.id)?'open':''}><summary>${Icon('messages','sm')}${esc(tr('readMessage'))}${recruiter&&!app.readAt?`<span class="badge">${esc(tr('unread'))}</span>`:''}</summary><p data-authored class="live-message-body">${esc(app.message)}</p></details><div class="live-application-footer"><span class="op-small">${esc(tr(app.readAt?'readByRecruiter':'delivered'))}</span>${app.status==='pending'?(recruiter?`<button class="btn btn-secondary" type="button" data-review="accepted" data-id="${esc(app.id)}">${Icon('check','sm')}${esc(tr('accept'))}</button><button class="btn btn-secondary" type="button" data-review="rejected" data-id="${esc(app.id)}">${Icon('close','sm')}${esc(tr('reject'))}</button>`:`<button class="btn btn-secondary" type="button" data-review="withdrawn" data-id="${esc(app.id)}">${esc(tr('withdraw'))}</button>`):''}</div></article>`).join('')}</div>`:`<div class="op-empty"><img class="state-art" src="assets/illustrations/empty.svg" width="176" height="128" alt=""><h2>${esc(tr('noApplications'))}</h2><p>${esc(tr(recruiter?'inboxHint':'studentHint'))}</p></div>`;
  }
  function open(){
    returnFocus=document.activeElement;
    if(!host){host=document.createElement('section');host.id='live-workspace';host.tabIndex=-1;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label',tr('account'));document.body.append(host);bind();}
    [...document.body.children].filter(element=>element!==host&&!['SCRIPT','LINK'].includes(element.tagName)).forEach(element=>{previousInert.set(element,element.inert);element.inert=true;});
    state.open=true;host.hidden=false;document.body.classList.add('workspace-open');render();host.focus();void refreshApplications();
  }
  function close(){state.open=false;if(host)host.hidden=true;previousInert.forEach((value,element)=>{element.inert=value;});previousInert.clear();document.body.classList.remove('workspace-open');returnFocus?.focus();}
  async function publish(offer){const result=await request('/api/offers',{method:'POST',body:offer});state.offers.unshift(result.offer);window.dispatchEvent(new Event('live-offers'));return result.offer;}
  function bind(){
    host.addEventListener('change',event=>{if(event.target.name==='role')host.querySelector('.live-recruiter-fields').hidden=event.target.value!=='recruiter';});
    host.addEventListener('submit',async event=>{
      if(!['live-auth-form','live-offer-form'].includes(event.target.id))return;
      event.preventDefault();const form=event.target;if(!form.reportValidity())return;
      const button=form.querySelector('[type=submit]');button.disabled=true;button.setAttribute('aria-busy','true');
      try{
        const values=Object.fromEntries(new FormData(form));
        if(form.id==='live-auth-form'){
          const data=await request('/api/'+(state.authMode==='register'?'register':'login'),{method:'POST',body:values});
          state.user=data.user;state.tab='applications';setRole();await refreshApplications();render();schedulePoll();window.dispatchEvent(new Event('live-session'));
        }else {await publish(values);state.tab='offers';render();feedback(tr('offerPublished'));}
      }catch(error){feedback(errorText(error),true);}
      finally{button.disabled=false;button.removeAttribute('aria-busy');}
    });
    host.addEventListener('click',async event=>{
      const button=event.target.closest('[data-live-action],[data-live-tab],[data-review]');if(!button)return;
      if(button.dataset.liveTab){state.tab=button.dataset.liveTab;render();return;}
      const action=button.dataset.liveAction;
      if(action==='close'){close();return;}
      if(action==='auth-mode'){state.authMode=state.authMode==='login'?'register':'login';render();return;}
      button.disabled=true;
      try{
        if(action==='logout'){await request('/api/logout',{method:'POST',body:{}});state.user=null;state.applications=[];clearTimeout(pollTimer);setRole();render();window.dispatchEvent(new Event('live-session'));}
        if(button.dataset.review){await request('/api/applications/'+encodeURIComponent(button.dataset.id),{method:'PATCH',body:{status:button.dataset.review}});await refreshApplications();}
      }catch(error){feedback(errorText(error),true);}finally{button.disabled=false;}
    });
    host.addEventListener('toggle',async event=>{
      if(state.user?.role!=='recruiter'||!event.target.matches('details[open][data-message-id]'))return;
      const id=event.target.dataset.messageId,app=state.applications.find(item=>item.id===id);if(!app||app.readAt)return;
      try{await request('/api/applications/'+encodeURIComponent(id),{method:'PATCH',body:{action:'read'}});app.readAt=new Date().toISOString();event.target.querySelector('.badge')?.remove();}
      catch(error){feedback(errorText(error),true);}
    },true);
    host.addEventListener('keydown',event=>{
      if(event.key==='Escape'){close();return;}if(event.key!=='Tab')return;
      const items=[...host.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,summary')].filter(element=>element.getClientRects().length);
      if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1)?.focus();}
      else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0]?.focus();}
    });
  }
  async function initialize(){
    if(!['http:','https:'].includes(location.protocol))return;
    try{
      const [session,offers]=await Promise.all([request('/api/session'),request('/api/offers')]);
      state.enabled=true;state.user=session.user;state.offers=offers.offers;setRole();await refreshApplications();schedulePoll();
      window.dispatchEvent(new Event('live-ready'));
      if(new URLSearchParams(location.search).has('workspace')){window.workspaceDemo?.close?.();setRole();open();}
    }catch{if(state.enabled){setRole();if(new URLSearchParams(location.search).has('workspace')){open();feedback(tr('errors.server_unavailable'),true);}}}
  }
  window.LiveApp={get enabled(){return state.enabled;},get user(){return state.user;},get offers(){return state.offers;},get applications(){return state.applications;},open,close,publish,errorText,
    async apply(id,message){const result=await request('/api/offers/'+encodeURIComponent(id)+'/applications',{method:'POST',body:{message}});await refreshApplications();return result;}
  };
  document.addEventListener('click',event=>{
    if(!state.enabled)return;
    const target=event.target.closest('#login-btn,a[href*="workspace=1"]');
    if(target){event.preventDefault();event.stopImmediatePropagation();open();}
  },true);
  document.addEventListener('visibilitychange',()=>{schedulePoll();if(!document.hidden)void refreshApplications();});
  window.addEventListener('languagechange',()=>{if(state.enabled){setRole();if(state.open)render();}});
  document.addEventListener('DOMContentLoaded',()=>{void initialize();});
})();
