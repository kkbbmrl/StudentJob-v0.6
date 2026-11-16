/* Shared demo offers used by the catalog, detail pages and companies. */
(() => {
const legacyOffers = [
      {
        id: 'mis_001',
        category: 'tutoring',
        wilaya: 'Alger',
        commune: { fr: 'Kouba, Alger', en: 'Kouba, Algiers', ar: 'القبة، الجزائر' },
        isRemote: false,
        payAmount: 6000,
        duration: { fr: '6h (3 séances)', en: '6h (3 sessions)', ar: '6 ساعات (3 حصص)' },
        employer: { fr: 'Dr. Selim Rahal', en: 'Dr. Selim Rahal', ar: 'د. سليم رحال' },
        isUrgent: true,
        featured: true,
        title: {
          fr: 'Soutien scolaire intensif en Mathématiques (Préparation BEM)',
          en: 'Intensive Mathematics Tutoring (BEM Exam Prep)',
          ar: 'دروس دعم مكثفة في الرياضيات (تحضير شهادة التعليم المتوسط)'
        },
        skills: {
          fr: ['Maths BEM', 'Pédagogie', 'USTHB / ESI'],
          en: ['BEM Math', 'Pedagogy', 'USTHB / ESI'],
          ar: ['رياضيات BEM', 'منهجية تدريس', 'طالب USTHB / ESI']
        }
      },
      {
        id: 'mis_002',
        category: 'events',
        wilaya: 'Alger',
        commune: { fr: 'Pins Maritimes (SAFEX)', en: 'Pins Maritimes (SAFEX)', ar: 'الصنوبر البحري (SAFEX)' },
        isRemote: false,
        payAmount: 18000,
        duration: { fr: '3 jours consécutifs', en: '3 consecutive days', ar: '3 أيام متتالية' },
        employer: { fr: 'EventPro Algérie (SAFEX)', en: 'EventPro Algeria (SAFEX)', ar: 'إيفنت برو الجزائر (SAFEX)' },
        isUrgent: true,
        featured: true,
        title: {
          fr: 'Hôtesses & agents d\'accueil bilingues — Salon BATIMATEC SAFEX',
          en: 'Bilingual Event Hosts & Badge Desk — BATIMATEC Expo SAFEX',
          ar: 'مضيفون وأعوان استقبال وتوجيه — صالون باتيماتيك SAFEX'
        },
        skills: {
          fr: ['Bilingue FR/AR', 'Accueil VIP', 'Badges'],
          en: ['Bilingual FR/AR', 'VIP Desk', 'Badges'],
          ar: ['ثنائي اللغة عربي/فرنسي', 'استقبال الوفود', 'تنظيم']
        }
      },
      {
        id: 'mis_003',
        category: 'design',
        wilaya: 'Oran',
        commune: { fr: 'Oran / Télétravail', en: 'Oran / Remote', ar: 'وهران / عن بُعد' },
        isRemote: true,
        payAmount: 12000,
        duration: { fr: '10 heures (Flexible)', en: '10 hours (Flexible)', ar: '10 ساعات (مرن)' },
        employer: { fr: 'Karim Touati (InnovDigital)', en: 'Karim Touati (InnovDigital)', ar: 'كريم تواتي (InnovDigital)' },
        isUrgent: false,
        featured: true,
        title: {
          fr: 'Création de 12 carrousels Instagram & stories (Figma / Canva)',
          en: 'Design 12 Instagram Carousels & Stories (Figma / Canva)',
          ar: 'تصميم 12 منشوراً ترويجياً لإنستغرام (Figma / Canva)'
        },
        skills: {
          fr: ['Figma', 'Canva Pro', 'Social Media'],
          en: ['Figma', 'Canva Pro', 'Social Media'],
          ar: ['فيغما Figma', 'كانفا Canva', 'سوشيال ميديا']
        }
      },
      {
        id: 'mis_004',
        category: 'tech',
        wilaya: 'Bordj Bou Arreridj',
        commune: { fr: 'Bordj Bou Arreridj / Remote', en: 'Bordj Bou Arreridj / Remote', ar: 'برج بوعريريج / عن بُعد' },
        isRemote: true,
        payAmount: 9500,
        duration: { fr: '8 heures', en: '8 hours', ar: '8 ساعات' },
        employer: { fr: 'Khaled Pièces Auto (E-Commerce)', en: 'Khaled Auto Parts (E-Commerce)', ar: 'خالد لقطع الغيار (متجر إلكتروني)' },
        isUrgent: true,
        featured: false,
        title: {
          fr: 'Structuration catalogue Excel & optimisation photos produits WebP',
          en: 'Excel Catalog Structuring & WebP Product Photo Batch Prep',
          ar: 'تنظيم كتالوج قطع الغيار على Excel وضغط صور المنتجات'
        },
        skills: {
          fr: ['Excel', 'Saisie rapide', 'Organisation'],
          en: ['Excel', 'Fast Typing', 'Cataloging'],
          ar: ['برنامج Excel', 'إدخال بيانات دقيق', 'تنظيم الصور']
        }
      },
      {
        id: 'mis_005',
        category: 'writing',
        wilaya: 'Constantine',
        commune: { fr: 'Constantine / Télétravail', en: 'Constantine / Remote', ar: 'قسنطينة / عن بُعد' },
        isRemote: true,
        payAmount: 15000,
        duration: { fr: '15 heures', en: '15 hours', ar: '15 ساعة' },
        employer: { fr: 'Cabinet Atlas Consulting', en: 'Atlas Consulting Group', ar: 'مكتب أطلس للاستشارات' },
        isUrgent: false,
        featured: false,
        title: {
          fr: 'Traduction d\'un guide technique de 25 pages (Français vers Arabe)',
          en: 'Technical Manual Translation — 25 Pages (French to Arabic)',
          ar: 'ترجمة دليل تقني من 25 صفحة (من الفرنسية إلى العربية)'
        },
        skills: {
          fr: ['Traduction FR-AR', 'Terminologie', 'Relecture'],
          en: ['FR-AR Translation', 'Technical Terms', 'Proofreading'],
          ar: ['ترجمة فرنسي-عربي', 'مصطلحات تقنية', 'تدقيق لغوي']
        }
      },
      {
        id: 'mis_006',
        category: 'retail',
        wilaya: 'Alger',
        commune: { fr: 'Chéraga, Alger', en: 'Cheraga, Algiers', ar: 'الشراقة، الجزائر' },
        isRemote: false,
        payAmount: 4500,
        duration: { fr: '4.5h (Soirée week-end)', en: '4.5h (Weekend evening)', ar: '4.5 ساعات (نهاية الأسبوع)' },
        employer: { fr: 'Boutique Mode & Élégance', en: 'Mode & Elegance Boutique', ar: 'بوتيك الموضة والأناقة' },
        isUrgent: false,
        featured: false,
        title: {
          fr: 'Renfort inventaire de fin de mois et étiquetage en boutique',
          en: 'End-of-Month Store Inventory & Tagging Support',
          ar: 'مساعدة في الجرد الشهري للمخزون ووضع الملصقات بالمحل'
        },
        skills: {
          fr: ['Rigueur', 'Inventaire', 'Esprit d\'équipe'],
          en: ['Accuracy', 'Inventory', 'Teamwork'],
          ar: ['دقة في العد', 'تنظيم المخزون', 'عمل جماعي']
        }
      },
      {
        id: 'mis_007',
        category: 'tech',
        wilaya: 'Alger',
        commune: { fr: 'Dely Ibrahim / Télétravail', en: 'Dely Ibrahim / Remote', ar: 'دالي إبراهيم / عن بُعد' },
        isRemote: true,
        payAmount: 16000,
        duration: { fr: '12 heures', en: '12 hours', ar: '12 ساعة' },
        employer: { fr: 'Startup YassirPartner Lab', en: 'YassirPartner Lab Startup', ar: 'شركة ناشئة YassirPartner' },
        isUrgent: false,
        featured: true,
        title: {
          fr: 'Intégration d\'une landing page responsive HTML/CSS à partir de Figma',
          en: 'Responsive HTML/CSS Landing Page Build from Figma Spec',
          ar: 'برمجة صفحة هبوط متجاوبة HTML/CSS انطلاقاً من تصميم Figma'
        },
        skills: {
          fr: ['HTML/CSS', 'JavaScript', 'Responsive'],
          en: ['HTML/CSS', 'JavaScript', 'Responsive'],
          ar: ['HTML/CSS', 'جافاسكريبت', 'تصميم متجاوب']
        }
      },
      {
        id: 'mis_008',
        category: 'delivery',
        wilaya: 'Alger',
        commune: { fr: 'Bab Ezzouar, Alger', en: 'Bab Ezzouar, Algiers', ar: 'باب الزوار، الجزائر' },
        isRemote: false,
        payAmount: 3500,
        duration: { fr: '4 heures (Samedi)', en: '4 hours (Saturday)', ar: '4 ساعات (يوم السبت)' },
        employer: { fr: 'Librairie Campus Plus', en: 'Campus Plus Bookstore', ar: 'مكتبة كامبوس بلوس' },
        isUrgent: true,
        featured: false,
        title: {
          fr: 'Distribution de kits de rentrée et flyers devant le campus USTHB',
          en: 'Campus Welcome Kit & Flyer Distribution near USTHB Gate',
          ar: 'توزيع مطويات وحقائب ترحيبية أمام مدخل جامعة باب الزوار USTHB'
        },
        skills: {
          fr: ['Dynamisme', 'Ponctualité', 'Contact étudiant'],
          en: ['Energy', 'Punctuality', 'Campus Outreach'],
          ar: ['حيوية ونشاط', 'انضباط في الوقت', 'تواصل طلابي']
        }
      },
      {
        id: 'mis_009',
        category: 'tutoring',
        wilaya: 'Sétif',
        commune: { fr: 'Sétif Centre', en: 'Setif Center', ar: 'وسط مدينة سطيف' },
        isRemote: false,
        payAmount: 7500,
        duration: { fr: '5 heures (2 séances)', en: '5 hours (2 sessions)', ar: '5 ساعات (حصتان)' },
        employer: { fr: 'Famille Benmansour', en: 'Benmansour Family', ar: 'عائلة بن منصور' },
        isUrgent: false,
        featured: false,
        title: {
          fr: 'Préparation sujets Physique-Chimie Terminale Scientifique (BAC)',
          en: 'Physics & Chemistry BAC Exam Past-Paper Coaching',
          ar: 'مراجعة مواضيع الفيزياء والكيمياء لتحضير شهادة البكالوريا'
        },
        skills: {
          fr: ['Physique BAC', 'Annales', 'Pédagogie'],
          en: ['BAC Physics', 'Past Papers', 'Coaching'],
          ar: ['فيزياء بكالوريا', 'حل حوليات', 'تبسيط المفاهيم']
        }
      }
    ];
  const types = {job:'Emploi',parttime:'Travail à temps partiel',freelance:'Travail indépendant',internship:'Stage',service:'Service étudiant',course:'Formation',conference:'Conférence'};
  const groups = {work:'Emplois & travail',development:'Services, stages & apprentissage'};
  const groupFor = type => ['job','parttime','freelance'].includes(type) ? 'work' : 'development';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
  const local = value => value && typeof value==='object' ? (value.fr ?? '') : (value ?? '');
  const lines = value => (Array.isArray(value)?value:String(value||'').split('\n')).map(x=>String(x).replace(/^\s*[-•]\s*/,'').trim()).filter(Boolean);
  const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Algiers',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const isClosed = offer => offer.closesOn < today();
  const date = value => window.I18n ? I18n.date(value) : new Intl.DateTimeFormat('fr-DZ',{dateStyle:'long',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  const companySeeds = [
    {id:'innovdigital',name:'InnovDigital',sector:'Technologie & numérique',location:'Alger',size:'15–50',initials:'ID',color:'#4f6bff',description:'Une agence numérique qui accompagne les entreprises dans la création de produits web, mobiles et de contenus. Nos équipes accueillent des étudiants pour développer leurs compétences sur des projets concrets.',benefits:['Un encadrement par des professionnels du numérique.','Des horaires compatibles avec les études.','Une culture de partage et de collaboration.']},
    {id:'eventpro',name:'EventPro Algérie',sector:'Événementiel & communication',location:'Alger',size:'10–25',initials:'EP',color:'#ca6650',description:'Un collectif spécialisé dans l’organisation de salons et de rencontres professionnelles. Découvrez les métiers de l’accueil, de la logistique et de la communication.',benefits:['Une première expérience sur le terrain.','Des équipes disponibles pour vous accompagner.','Des opportunités ponctuelles le week-end.']},
    {id:'campus-academy',name:'Campus Academy',sector:'Éducation & formation',location:'Oran',size:'15–30',initials:'CA',color:'#15826a',description:'Un organisme de démonstration dédié à la formation pratique des étudiants : ateliers numériques, accompagnement de carrière et apprentissage par projet.',benefits:['Des ateliers pratiques en petits groupes.','Un accompagnement pour préparer votre carrière.','Des formats en ligne et en présentiel.']},
    {id:'atlas-lab',name:'Atlas Innovation Lab',sector:'Innovation & recherche',location:'Constantine',size:'10–20',initials:'AL',color:'#8860bb',description:'Un espace de rencontre entre étudiants, professionnels et porteurs de projets. Nous organisons des conférences, des ateliers et des échanges autour de la technologie.',benefits:['Des rencontres avec des professionnels.','Des événements ouverts aux étudiants.','Des projets à construire en équipe.']}
  ];
  const responsibilities={tutoring:['Préparer des exercices adaptés au niveau des élèves.','Expliquer les notions et suivre les progrès.','Partager un bilan avec la famille.'],events:['Accueillir et orienter les visiteurs.','Accompagner les équipes pendant l’événement.','Respecter les consignes et les horaires convenus.'],design:['Analyser le besoin et préparer une proposition graphique.','Créer les visuels et intégrer les retours.','Livrer les fichiers sources et les exports.'],tech:['Analyser les besoins et préparer les données ou fonctionnalités.','Réaliser et tester les travaux demandés.','Documenter les résultats et préparer la livraison.'],writing:['Préparer la rédaction ou la traduction des contenus.','Vérifier la terminologie et relire les documents.','Livrer les fichiers au format convenu.'],retail:['Accueillir les clients et présenter les produits.','Participer à la mise en rayon.','Accompagner l’équipe de vente.'],delivery:['Préparer la tournée avec le responsable.','Distribuer les supports aux points convenus.','Confirmer la réalisation de la tournée.']};
  const seedOffers=legacyOffers.map((m,i)=>({...m,opportunityType:i===0||i===8?'parttime':i===2||i===3||i===4||i===6?'freelance':'job',group:'work',closesOn:'2026-12-31',companyId:m.employer.fr.includes('InnovDigital')?'innovdigital':i===1?'eventpro':null,description:'Une opportunité de démonstration pour acquérir de l’expérience en parallèle de vos études.',duties:responsibilities[m.category],profile:['Étudiant ou étudiante dans un domaine pertinent.',...m.skills.fr],languages:['Arabe : courant.','Français : bon niveau.'],qualities:['Autonomie et respect des délais.','Esprit d’équipe et envie d’apprendre.'],conditions:['Contrat : travail ponctuel.','Durée : '+m.duration.fr,'Environnement : '+(m.isRemote?'télétravail.':'sur place.')]}));
  function opportunity(id,title,type,companyId,location,extra){const company=companySeeds.find(c=>c.id===companyId);return {id,category:'tech',title:{fr:title,en:title,ar:title},employer:{fr:company.name,en:company.name,ar:company.name},companyId,wilaya:location,commune:{fr:location,en:location,ar:location},isRemote:false,workMode:'onsite',payAmount:0,duration:{fr:'1 journée',en:'1 day',ar:'يوم واحد'},skills:{fr:['Étudiants','Apprentissage'],en:['Students','Learning'],ar:['طلاب','تعلم']},featured:true,opportunityType:type,group:groupFor(type),closesOn:'2026-12-20',description:'Une opportunité de démonstration pour préparer votre avenir professionnel.',duties:['Participer aux activités proposées.','Mettre en pratique les acquis et échanger avec les intervenants.'],profile:['Être étudiant ou jeune diplômé.','Être motivé et disponible pour les activités.'],languages:['Français : bon niveau.','Arabe : courant.'],qualities:['Curiosité et motivation.','Participation et esprit d’équipe.'],conditions:['Accès : gratuit pour les étudiants.','Inscription préalable requise.'],...extra};}
  seedOffers.push(
    opportunity('offer-internship','Stage — Développement web & mobile','internship','innovdigital','Alger',{
      workMode:'hybrid',duration:{fr:'6 mois',en:'6 months',ar:'6 أشهر'},payAmount:18000,compensation:'Indemnité de stage : 18 000 DZD / mois (démo)',
      description:'Rejoignez une équipe produit et participez à la conception de solutions web et mobiles, de l’analyse du besoin jusqu’au déploiement.',
      duties:['Aider à analyser les besoins des départements et rédiger les spécifications.','Contribuer au développement d’applications web et mobiles (front-end et back-end).','Participer à la conception et à l’optimisation des bases de données.','Contribuer à l’intégration avec les outils existants (ERP, API).','Participer aux tests, à la documentation, au déploiement et à la maintenance.'],
      profile:['Étudiant en informatique, génie logiciel ou domaine connexe.','Maîtrise d’un framework web (Laravel, Django, React, Flutter…), de SQL et de Git.','Une expérience en stage, projet universitaire ou personnel serait un atout.'],
      languages:['Arabe : courant.','Français : courant.','Anglais : bon niveau.'],qualities:['Autonomie et respect des délais.','Esprit d’analyse.','Curiosité technique.'],conditions:['Type de contrat : stage.','Durée : 6 mois.','Environnement de travail : hybride.','Accompagnement par un développeur expérimenté.']
    }),
    opportunity('offer-course','Atelier pratique — Votre premier projet React','course','campus-academy','Oran',{isRemote:true,workMode:'remote',duration:{fr:'4 samedis',en:'4 Saturdays',ar:'4 أيام سبت'},duties:['Construire une interface React à partir d’une maquette.','Gérer les composants et les données.','Présenter votre projet et recevoir des retours.'],profile:['Connaissances de base en HTML, CSS et JavaScript.','Disposer d’un ordinateur et d’une connexion internet.'],conditions:['Formation gratuite de démonstration.','Format : en ligne, le samedi.','Durée : 4 séances de 3 heures.']}),
    opportunity('offer-conference','Conférence — IA, métiers et avenir des étudiants','conference','atlas-lab','Constantine',{duties:['Assister aux interventions sur les métiers du numérique.','Participer aux échanges avec les professionnels.','Découvrir des parcours et projets étudiants.'],conditions:['Entrée gratuite sur inscription.','Format : présentiel à Constantine.','Durée : une journée.']}),
    opportunity('offer-service','Accompagnement carrière — CV et entretien','service','campus-academy','Oran',{duties:['Préparer votre CV avec un conseiller.','Participer à une simulation d’entretien.','Construire un plan de recherche d’opportunités.'],conditions:['Service gratuit pour les étudiants.','Rendez-vous individuel de 45 minutes.','Disponible à Oran et en visioconférence.'],workMode:'hybrid'})
  );
  const custom=()=>{const value=read('jobetudiant_offers',[]);return Array.isArray(value)?value.filter(m=>m&&typeof m.id==='string'&&m.title&&types[m.opportunityType]):[];};
  const all=()=>window.LiveApp?.enabled&&window.LiveApp.offers.length?[...window.LiveApp.offers]:[...custom(),...seedOffers];
  const isVisible=id=>{const w=read('jobetudiant_workspace',{});return !(w.hidden||[]).includes(id)&&!(w.paused||[]).includes(id);};
  const get=id=>all().find(m=>m.id===id);
  const slug=name=>'company-'+Array.from(name).map(c=>c.codePointAt(0).toString(16)).join('-');
  function companies(){const result=companySeeds.map(c=>({...c}));for(const offer of all()){const name=local(offer.employer);if(!offer.companyId)offer.companyId=slug(name);if(!result.some(c=>c.id===offer.companyId)){result.push({id:offer.companyId,name,sector:'Services & recrutement',location:offer.wilaya,size:'Non précisé',initials:name.split(' ').map(w=>w[0]).slice(0,2).join(''),color:'#4f6bff',description:offer.companyDescription||'Découvrez les opportunités de cet employeur de démonstration pour les étudiants.',benefits:['Consultez les offres disponibles et leurs conditions.']});}}return result;}
  seedOffers.forEach(m=>{if(!m.companyId)m.companyId=slug(local(m.employer));});
  function add(offer){offer.companyId=companySeeds.find(c=>c.name.toLowerCase()===local(offer.employer).toLowerCase())?.id||slug(local(offer.employer));return write('jobetudiant_offers',[offer,...custom()]);}
  function applied(){if(window.LiveApp?.enabled)return window.LiveApp.applications.filter(app=>app.status!=='withdrawn').map(app=>app.offerId);const a=read('jobetudiant_applied',[]);return Array.isArray(a)?a:[];}
  function apply(id,message,applicant={}){
    const offer=get(id);
    if(!offer||!isVisible(id)||isClosed(offer))return false;
    const previousIds=applied();const ids=[...previousIds];if(!ids.includes(id))ids.push(id);
    if(!write('jobetudiant_applied',ids))return false;
    const submissions=read('jobetudiant_submissions',{});
    submissions[id]={...applicant,message,submittedAt:new Date().toISOString()};
    if(!write('jobetudiant_submissions',submissions)){write('jobetudiant_applied',previousIds);return false;}
    const w=read('jobetudiant_workspace',null);
    if(w?.applications&&w.profiles?.student){
      const name=w.profiles.student.name;
      if(!w.applications.some(a=>a.missionId===id&&a.name===name))w.applications.push({id:'app-'+id,missionId:id,name,status:'En attente',message,applicant});
      write('jobetudiant_workspace',w);
    }
    return true;
  }
  window.OfferStore={types,groups,groupFor,read,write,local:value=>value&&typeof value==='object'?(value[window.I18n?.language||'fr']??value.fr??''):value??'',lines,today,isClosed,date,seedOffers,all,get,add,companies,isVisible,applied,apply};
})();
