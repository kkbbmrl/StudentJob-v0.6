/* Demo workspaces share the existing marketplace state. No authentication is performed. */
document.addEventListener('DOMContentLoaded', () => {
  const api = window.jobWorkspace;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults = () => ({
    profiles: {
      student: {name:'Yasmine Belkacem',email:'yasmine@example.com',organization:'USTHB · Master 1 Génie Logiciel',city:'Alger',bio:'Étudiante en informatique, disponible les week-ends.',skills:'JavaScript, design, soutien scolaire'},
      recruiter: {name:'Karim Touati',email:'karim@example.com',organization:'InnovDigital',city:'Alger · Dely Ibrahim',bio:'Agence digitale à la recherche de talents étudiants.',skills:'Design, développement web, événementiel'},
      admin: {name:'Amine Benali',email:'amine@example.com',organization:'JobEtudiant · Modération',city:'Alger',bio:'Accompagnement des utilisateurs et qualité des missions.',skills:'Modération, assistance, vérification'}
    },
    applications:[{id:'demo-1',missionId:'mis_001',name:'Yasmine Belkacem',status:'En attente'},{id:'demo-2',missionId:'mis_003',name:'Yasmine Belkacem',status:'Acceptée'},{id:'demo-3',missionId:'mis_002',name:'Rayan Mansouri',status:'En attente'}],
    users:[{id:1,name:'Yasmine Belkacem',role:'Étudiante',status:'Vérifié'},{id:2,name:'Karim Touati',role:'Recruteur',status:'Vérifié'},{id:3,name:'Rayan Mansouri',role:'Étudiant',status:'À vérifier'},{id:4,name:'Studio Atlas',role:'Recruteur',status:'À vérifier'}], hidden:[], paused:[]
  });
  let data;
  try { data=JSON.parse(localStorage.getItem('jobetudiant_workspace')); if (!data?.profiles?.admin || !Array.isArray(data.applications)) data=defaults(); } catch { data=defaults(); }
  let role=OfferStore.read('jobetudiant_role','student'), tab='overview', query='';
  if(!['student','recruiter','admin'].includes(role))role='student';
  function updateRole(){
    document.documentElement.dataset.demoRole=role;
    OfferStore.write('jobetudiant_role',role);
    ['header-post-btn','mobile-post-btn','hero-post-btn','final-post-btn','footer-post-link'].forEach(id=>{
      const button=document.getElementById(id);
      if(button) button.hidden=role!=='recruiter';
    });
  }
  let returnFocus;
  const background=[...document.body.children].filter(el=>!['SCRIPT','LINK'].includes(el.tagName));
  const roles={student:'Étudiant',recruiter:'Recruteur',admin:'Administrateur'};
  const labels={overview:'Vue d’ensemble',applications:'Candidatures',jobs:'Mes offres',users:'Utilisateurs',moderation:'Modération',profile:'Mon profil'};
  const host=document.createElement('section'); host.id='workspace'; host.hidden=true; host.setAttribute('aria-label','Espace personnel'); host.tabIndex=-1; document.body.append(host);
  const launcher=document.createElement('button'); launcher.className='btn btn-primary workspace-launcher'; launcher.textContent='Espace démo'; document.body.append(launcher);
  function save(){try{localStorage.setItem('jobetudiant_workspace',JSON.stringify(data));}catch{api.showToast('Stockage indisponible : modifications conservées pour cette session.');}}
  function sync(){
    api.state.appliedIds.forEach(id=>{if(!data.applications.some(a=>a.missionId===id&&a.name===data.profiles.student.name))data.applications.push({id:'app-'+id,missionId:id,name:data.profiles.student.name,status:'En attente'});});
  }
  const money=n=>I18n.currency(n);
  const title=m=>m ? (m.title[api.state.lang]||m.title.fr) : 'Offre archivée';
  const mission=id=>api.state.missions.find(m=>m.id===id);
  const badge=s=>`<span class="ws-badge ${['Acceptée','Vérifié','Active','Approuvée'].includes(s)?'ws-good':['Refusée','Suspendu','Masquée'].includes(s)?'ws-muted':''}">${esc(s)}</span>`;
  const action=(label,kind,id)=>`<button class="ws-action" data-action="${kind}" data-id="${esc(id)}">${label}</button>`;
  function showDetails(id){ location.href='offer.html?id='+encodeURIComponent(id); }
  document.getElementById('post-mode').addEventListener('change',event=>{
    const location=document.getElementById('post-wilaya-select');
    location.disabled=event.target.value==='remote';
  });
  function table(headers,rows){return `<div class="ws-table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>{let column=0;return row.replace(/<td(\s[^>]*)?>/g,(_,attrs='')=>'<td'+attrs+' data-label="'+esc(headers[column++]||'')+'">');}).join(''):`<tr><td colspan="${headers.length}" class="ws-empty">Aucun résultat. Essayez une autre recherche.</td></tr>`}</tbody></table></div>`;}
  function apps(){
    const list=data.applications.filter(a=>(role!=='student'||a.name===data.profiles.student.name)&&`${a.name} ${title(mission(a.missionId))} ${a.status}`.toLowerCase().includes(query));
    return table(['Offre','Candidat','Rémunération','Statut','Action'],list.map(a=>`<tr><td><button class="mission-detail-link" data-action="details" data-id="${esc(a.missionId)}">${esc(title(mission(a.missionId)))}</button></td><td>${esc(a.name)}</td><td>${money(mission(a.missionId)?.payAmount||0)}</td><td>${badge(a.status)}</td><td>${a.status==='En attente'?(role==='student'?action('Retirer','withdraw',a.id):action('Accepter','accept',a.id)+action('Refuser','reject',a.id)):'—'}</td></tr>`));
  }
  function jobs(moderation=false){
    const list=api.state.missions.filter(m=>(moderation||m.employer.fr.includes('InnovDigital')||m.owner==='demo-recruiter')&&title(m).toLowerCase().includes(query));
    return table(['Offre','Wilaya','Rémunération','Statut','Action'],list.map(m=>{const status=moderation?(data.hidden.includes(m.id)?'Masquée':'Approuvée'):(data.paused.includes(m.id)?'En pause':'Active');return `<tr><td><button class="mission-detail-link" data-action="details" data-id="${esc(m.id)}">${esc(title(m))}</button><small>${esc(m.employer.fr)}</small></td><td>${esc(m.wilaya)}</td><td>${money(m.payAmount)}</td><td>${badge(status)}</td><td>${action(moderation?(status==='Masquée'?'Restaurer':'Masquer'):(status==='Active'?'Mettre en pause':'Réactiver'),moderation?'moderate':'pause',m.id)}</td></tr>`;}));
  }
  function profile(){const p=data.profiles[role];return `<div class="ws-profile"><aside class="ws-profile-card"><div class="ws-avatar">${esc(p.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><h2>${esc(p.name)}</h2><p>${roles[role]}</p>${badge('Profil démo')}<p data-authored>${esc(p.organization)}</p><p data-authored>${esc(p.bio)}</p></aside><form id="ws-profile-form" class="ws-card"><h2>Informations personnelles</h2><p class="ws-sub">Les modifications sont enregistrées dans ce navigateur.</p><div class="ws-form-grid">${[['name','Nom complet'],['email','Adresse e-mail'],['organization',role==='student'?'Université et formation':role==='recruiter'?'Entreprise':'Équipe'],['city','Localisation'],['skills','Compétences et spécialités']].map(([key,label])=>`<label>${label}<input class="input-field" name="${key}" value="${esc(p[key])}" ${key==='email'?'type="email"':'type="text"'} required maxlength="160"></label>`).join('')}<label class="ws-wide">Présentation<textarea class="input-field" name="bio" rows="3" maxlength="600">${esc(p.bio)}</textarea></label></div><button class="btn btn-primary" type="submit">Enregistrer le profil</button></form></div>`;}
  function content(){
    if(tab==='profile')return profile();
    if(tab==='applications')return apps();
    if(tab==='jobs')return jobs();
    if(tab==='moderation')return jobs(true);
    if(tab==='users')return table(['Utilisateur','Rôle','Vérification','Action'],data.users.filter(u=>`${u.name} ${u.role}`.toLowerCase().includes(query)).map(u=>`<tr><td><strong>${esc(u.name)}</strong></td><td>${u.role}</td><td>${badge(u.status)}</td><td>${u.status==='À vérifier'?action('Vérifier','verify',u.id):''}${action(u.status==='Suspendu'?'Réactiver':'Suspendre','suspend',u.id)}</td></tr>`));
    const own=data.applications.filter(a=>a.name===data.profiles.student.name);
    const metrics=role==='student'?[['Candidatures',own.length],['Offres acceptées',own.filter(a=>a.status==='Acceptée').length],['Offres sauvegardées',api.state.savedIds.size],['Revenus démo',money(18500)]]:role==='recruiter'?[['Offres actives',api.state.missions.filter(m=>(m.employer.fr.includes('InnovDigital')||m.owner==='demo-recruiter')&&!data.paused.includes(m.id)&&!data.hidden.includes(m.id)).length],['Candidatures',data.applications.length],['Talents retenus',data.applications.filter(a=>a.status==='Acceptée').length],['Budget démo',money(42000)]]:[['Utilisateurs démo',data.users.length],['Offres visibles',api.state.missions.filter(m=>!data.hidden.includes(m.id)&&!data.paused.includes(m.id)).length],['Profils à vérifier',data.users.filter(u=>u.status==='À vérifier').length],['Offres masquées',data.hidden.length]];
    return `<div class="ws-metrics">${metrics.map(([l,v])=>`<article><span>${l}</span><strong>${v}</strong></article>`).join('')}</div><div class="ws-feature"><div><span class="ws-eyebrow">${role==='student'?'VOTRE PROCHAINE ÉTAPE':role==='recruiter'?'VOS PROCHAINS TALENTS':'LA CONFIANCE, AU QUOTIDIEN'}</span><h2>${role==='student'?'Une offre qui respecte vos études.':role==='recruiter'?'Faites avancer vos projets.':'Un espace sûr pour chaque rencontre.'}</h2><p>${role==='student'?'Retrouvez vos candidatures et préparez votre prochaine opportunité.':role==='recruiter'?'Consultez les profils et sélectionnez les étudiants disponibles.':'Examinez les profils en attente et contrôlez les annonces du catalogue.'}</p></div>${action(role==='student'?'Trouver une offre':role==='recruiter'?'Publier une offre':'Vérifier les profils',role==='student'?'browse':role==='recruiter'?'post':'review','')}</div><div class="ws-section-heading"><h2>${role==='admin'?'Derniers utilisateurs':'Suivi des candidatures'}</h2><span>Données de démonstration</span></div>${role==='admin'?table(['Utilisateur','Rôle','Statut'],data.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${u.role}</td><td>${badge(u.status)}</td></tr>`)):apps()}<div class="ws-note">${role==='student'?'Disponibilité démo : samedi et dimanche · Prochain versement illustratif : 8 000 DZD':role==='recruiter'?'Les paiements et les vérifications sont simulés dans ce prototype.':'Les actions de modération restent locales à ce navigateur.'}</div>`;
  }
  function render(){updateRole();sync();const p=data.profiles[role];const tabs=role==='student'?['overview','applications','profile']:role==='recruiter'?['overview','jobs','applications','profile']:['overview','users','moderation','profile'];host.innerHTML=`<div class="ws-demo-strip"><span>PROTOTYPE · Comptes fictifs · Aucun paiement réel</span><button data-action="reset">Réinitialiser la démo</button></div><div class="ws-shell"><aside class="ws-sidebar"><a href="#" data-action="browse" class="brand-logo ws-brand" aria-label="JobEtudiant Accueil">
        <span class="brand-logo-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </span>
        <span>JobEtudiant</span>
        <span class="brand-logo-tag">DZ</span>
      </a><label class="ws-switch">Explorer un espace<select aria-label="Espace de démonstration" id="ws-role">${Object.entries(roles).map(([v,l])=>`<option value="${v}" ${v===role?'selected':''}>${l}</option>`).join('')}</select></label><nav aria-label="Navigation de l’espace">${tabs.map(t=>`<button data-tab="${t}" ${t===tab?'aria-current="page"':''}>${labels[t]}</button>`).join('')}</nav><div class="ws-sidebar-bottom"><button data-action="browse">← Retour aux offres</button><p>Fait pour les talents<br>étudiants en Algérie.</p></div></aside><div class="ws-main"><header class="ws-topbar"><span>Espace ${roles[role].toLowerCase()}</span><button data-tab="profile" class="ws-identity">${esc(p.name)} <span class="ws-mini-avatar">${esc(p.name[0])}</span></button></header><div class="ws-body"><div class="ws-page-heading"><div><span class="ws-eyebrow">VOTRE ESPACE PERSONNEL</span><h1>${tab==='overview'?`Bonjour, ${esc(p.name.split(' ')[0])} 👋`:labels[tab]}</h1><p class="ws-sub">${tab==='overview'?'Tout ce dont vous avez besoin pour avancer, au même endroit.':'Gérez vos informations et vos activités de démonstration.'}</p></div>${role==='recruiter'&&tab!=='profile'?action('Publier une offre','post',''):''}</div>${!['overview','profile'].includes(tab)?'<label class="ws-search">Rechercher dans ce tableau<input class="input-field" id="ws-search" type="search" placeholder="Nom, offre, statut…" value="'+esc(query)+'"></label>':''}<div id="ws-content">${content()}</div><p class="ws-footnote" role="status" id="ws-feedback"></p></div></div></div>`;}
  function open(next=role){returnFocus=document.activeElement;role=next;tab='overview';query='';background.forEach(el=>el.inert=true);launcher.inert=true;host.hidden=false;document.body.classList.add('workspace-open');render();host.focus();host.scrollTop=0;}
  function close(){updateRole();background.forEach(el=>el.inert=false);host.hidden=true;launcher.inert=false;document.body.classList.remove('workspace-open');if(returnFocus?.getClientRects().length && !returnFocus.closest('[aria-hidden="true"]'))returnFocus.focus();else launcher.focus();}
  launcher.onclick=()=>open();
  ['student','employer'].forEach(r=>document.getElementById('demo-role-'+r).addEventListener('click',()=>open(r==='employer'?'recruiter':'student')));
  const admin=document.createElement('button');admin.type='button';admin.className='trust-pillar-card';admin.innerHTML='<div class="pillar-icon">AB</div><div><strong>Amine Benali — Administration</strong><div>Console de modération · Compte démo</div></div>';document.getElementById('demo-role-employer').after(admin);admin.onclick=()=>{api.closeModal('login-modal');open('admin');};
  host.addEventListener('change',e=>{if(e.target.id==='ws-role'){role=e.target.value;tab='overview';query='';render();host.querySelector('#ws-role').focus();}});
  host.addEventListener('input',e=>{if(e.target.id==='ws-search'){query=e.target.value.toLowerCase();host.querySelector('#ws-content').innerHTML=content();}});
  host.addEventListener('submit',e=>{if(e.target.id!=='ws-profile-form')return;e.preventDefault();const old=data.profiles[role].name;const fields=Object.fromEntries(new FormData(e.target));Object.keys(fields).forEach(k=>fields[k]=fields[k].trim());if(!fields.name)return;data.profiles[role]=fields;if(role==='student')data.applications.forEach(a=>{if(a.name===old)a.name=fields.name;});save();render();host.querySelector('#ws-feedback').textContent='Profil enregistré.';});
  host.addEventListener('click',e=>{
    const button=e.target.closest('[data-action],[data-tab]');if(!button)return;e.preventDefault();
    if(button.dataset.tab){tab=button.dataset.tab;query='';render();host.querySelector('.ws-sidebar [data-tab="'+tab+'"]').focus();return;}
    const {action:kind,id}=button.dataset;
    if(kind==='browse'){close();document.getElementById('missions').scrollIntoView();return;}
    if(kind==='post' && role==='recruiter'){close();api.openModal('post-modal');return;}
    if(kind==='details'){showDetails(id);return;}
    if(kind==='review'){tab='users';render();return;}
    if(kind==='reset'){data=defaults();api.state.appliedIds.clear();api.safeSetStorage('jobetudiant_applied',[]);api.state.savedIds=new Set(['mis_001','mis_003']);api.safeSetStorage('jobetudiant_saved',[...api.state.savedIds]);OfferStore.write('jobetudiant_offers',[]);OfferStore.write('jobetudiant_submissions',{});api.state.missions=OfferStore.all();save();api.renderMissions();render();return;}
    const app=data.applications.find(a=>a.id===id),user=data.users.find(u=>u.id===Number(id));
    if(kind==='accept'&&app)app.status='Acceptée';
    if(kind==='reject'&&app)app.status='Refusée';
    if(kind==='withdraw'&&app){data.applications=data.applications.filter(a=>a.id!==id);api.state.appliedIds.delete(app.missionId);api.safeSetStorage('jobetudiant_applied',[...api.state.appliedIds]);api.renderMissions();}
    if(kind==='verify'&&user)user.status='Vérifié';
    if(kind==='suspend'&&user)user.status=user.status==='Suspendu'?'À vérifier':'Suspendu';
    if(kind==='moderate'||kind==='pause'){const key=kind==='moderate'?'hidden':'paused';data[key]=data[key].includes(id)?data[key].filter(x=>x!==id):[...data[key],id];api.renderMissions();}
    save();render();host.querySelector('#ws-feedback').textContent='Modification enregistrée dans la démo.';
  });
  window.workspaceDemo={getRole:()=>role, showDetails, isVisible:id=>!data.hidden.includes(id)&&!data.paused.includes(id)};
  updateRole();
  api.renderMissions();
  if(new URLSearchParams(location.search).has('workspace'))open();
});


