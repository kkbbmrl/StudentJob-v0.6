import {createServer} from 'node:http';
import {mkdir,readFile} from 'node:fs/promises';
import {randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openDatabase} from './database.mjs';
import {seedDatabase} from './seeds.mjs';

const scrypt=promisify(scryptCallback);
const digest=value=>createHash('sha256').update(value).digest('hex');
const sessionDuration=7*24*60*60*1000;
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const publicFiles=new Set(['index.html','offer.html','companies.html','404.html','design-system.html','styles.css','tokens.css','script.js','dashboard.js','offers-data.js','offer-pages.js','offers-catalog.js','company-pages.js','offer-card.js','ui.js','i18n.js','live.js','site.webmanifest']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
export class ApiError extends Error {constructor(status,code){super(code);this.status=status;this.code=code;}}
const assert=(condition,status,code)=>{if(!condition)throw new ApiError(status,code);};
const text=(value,max=200)=>typeof value==='string'?value.trim().slice(0,max):'';
const publicUser=user=>({id:user.id,name:user.name,email:user.email,role:user.role,companyId:user.company_id,company:user.company_name??null});
const operation=(sql,...parameters)=>({sql,parameters});

/** Create an independently deployable, persistent application server. */
export async function createApplication({databasePath=resolve(root,'.data/studentjob.sqlite'),secureCookies=process.env.COOKIE_SECURE==='true',publicOrigin=process.env.PUBLIC_ORIGIN??null}={}){
  if(databasePath!==':memory:')await mkdir(dirname(databasePath),{recursive:true});
  const database=await openDatabase(databasePath);
  await seedDatabase(database);
  const attempts=new Map();

  async function session(request){
    const token=request.headers.cookie?.split(';').map(value=>value.trim()).find(value=>value.startsWith('studentjob_session='))?.slice(19);
    if(!token)return null;
    return await database.get('SELECT u.*,c.name company_name FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN companies c ON c.id=u.company_id WHERE s.token=? AND s.expires_at>?',digest(token),Date.now());
  }
  function cookie(token,expired=false){return `studentjob_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${expired?0:sessionDuration/1000}${secureCookies?'; Secure':''}`;}
  async function issueSession(user,response){
    const token=randomBytes(32).toString('hex');
    await database.run('DELETE FROM sessions WHERE expires_at<=?',Date.now());
    await database.run('INSERT INTO sessions(token,user_id,expires_at) VALUES (?,?,?)',digest(token),user.id,Date.now()+sessionDuration);
    response.setHeader('Set-Cookie',cookie(token));
  }
  async function body(request){
    assert(request.headers['content-type']?.startsWith('application/json'),415,'json_required');
    let length=0;const parts=[];
    for await(const chunk of request){length+=chunk.length;assert(length<=32768,413,'request_too_large');parts.push(chunk);}
    try {const value=JSON.parse(Buffer.concat(parts).toString());assert(value&&typeof value==='object'&&!Array.isArray(value),400,'invalid_json');return value;}
    catch {throw new ApiError(400,'invalid_json');}
  }
  function rateLimit(request){
    const now=Date.now(),key=request.socket.remoteAddress;
    if(attempts.size>1000)for(const [ip,entry] of attempts)if(entry.until<now)attempts.delete(ip);
    const old=attempts.get(key);const entry=old&&old.until>now?old:{count:0,until:now+60000};
    entry.count+=1;attempts.set(key,entry);assert(entry.count<=30,429,'too_many_attempts');
  }
  async function authenticate(request,role=null){const user=await session(request);assert(user,401,'login_required');assert(!role||user.role===role,403,'role_forbidden');return user;}
  function json(response,status,value){response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});response.end(JSON.stringify(value));}
  async function visibleOffers(){
    const rows=await database.all('SELECT o.*,c.owner_id,c.name company_name FROM offers o JOIN companies c ON c.id=o.company_id ORDER BY o.rowid DESC');
    return rows.map(row=>({...JSON.parse(row.payload),recruiterAvailable:Boolean(row.owner_id),companyId:row.company_id}));
  }
  async function register(request,response){
    rateLimit(request);const data=await body(request);
    const name=text(data.name,150),email=text(data.email,180).toLowerCase(),password=data.password,role=data.role;
    assert(name.length>=2&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),400,'invalid_identity');
    assert(typeof password==='string'&&password.length>=10&&password.length<=128,400,'invalid_password');
    assert(['student','recruiter'].includes(role),400,'invalid_role');
    const company=text(data.company,150);assert(role!=='recruiter'||company.length>=2||data.invitation,400,'company_required');
    const userId=randomUUID(),salt=randomBytes(16).toString('hex');
    const encoded=salt+':'+(await scrypt(password,salt,64)).toString('hex');
    const commands=[];let companyId=null;
    if(role==='recruiter'){
      if(data.invitation){
        const invite=await database.get('SELECT * FROM invitations WHERE token=? AND used_at IS NULL AND expires_at>?',digest(String(data.invitation)),Date.now());
        assert(invite,400,'invalid_invitation');
        const existing=await database.get('SELECT * FROM companies WHERE id=?',invite.company_id);assert(!existing.owner_id,409,'company_claimed');
        companyId=invite.company_id;
        commands.push({...operation('UPDATE companies SET owner_id=? WHERE id=? AND owner_id IS NULL',userId,companyId),expectChanges:1},operation('UPDATE invitations SET used_at=? WHERE token=?',new Date().toISOString(),invite.token));
      }else {
        companyId='company-'+randomUUID();commands.push(operation('INSERT INTO companies(id,name,owner_id) VALUES (?,?,?)',companyId,company,userId));
      }
    }
    commands.push(operation('INSERT INTO users(id,name,email,password,role,company_id) VALUES (?,?,?,?,?,?)',userId,name,email,encoded,role,companyId));
    try {await database.batch(commands,true);}catch(error){if(error.message.includes('UNIQUE'))throw new ApiError(409,'account_exists');if(error.message==='concurrent_update')throw new ApiError(409,'company_claimed');throw error;}
    const user=await database.get('SELECT u.*,c.name company_name FROM users u LEFT JOIN companies c ON c.id=u.company_id WHERE u.id=?',userId);
    await issueSession(user,response);json(response,201,{user:publicUser(user)});
  }
  async function login(request,response){
    rateLimit(request);const data=await body(request);const email=text(data.email,180).toLowerCase();
    assert(typeof data.password==='string'&&data.password.length<=128,400,'invalid_credentials');
    const user=await database.get('SELECT u.*,c.name company_name FROM users u LEFT JOIN companies c ON c.id=u.company_id WHERE email=?',email);
    const [salt,hash]=(user?.password??('0'.repeat(32)+':'+ '0'.repeat(128))).split(':');
    const candidate=await scrypt(data.password,salt,64);
    assert(user&&timingSafeEqual(candidate,Buffer.from(hash,'hex')),401,'invalid_credentials');
    await issueSession(user,response);json(response,200,{user:publicUser(user)});
  }
  async function publish(request,response){
    const user=await authenticate(request,'recruiter'),data=await body(request);
    const title=text(data.title?.fr??data.title,150),description=text(data.description,5000);
    const opportunityType=data.opportunityType;
    assert(title.length>=3&&description.length>=10&&['job','parttime','freelance','internship','service','course','conference'].includes(opportunityType),400,'invalid_offer');
    const closesOn=text(data.closesOn,10);assert(/^\d{4}-\d{2}-\d{2}$/.test(closesOn)&&!Number.isNaN(Date.parse(closesOn))&&new Date(closesOn).toISOString().slice(0,10)===closesOn&&closesOn>=new Date().toISOString().slice(0,10),400,'invalid_deadline');
    assert(['tutoring','events','design','writing','tech','retail','delivery'].includes(data.category),400,'invalid_category');
    const lines=value=>(Array.isArray(value)?value:typeof value==='string'?value.split('\n'):[]).slice(0,30).map(line=>text(line,500)).filter(Boolean);
    const localized=value=>({fr:value,en:value,ar:value});
    const offer={id:'offer-'+randomUUID(),companyId:user.company_id,owner:user.id,title:localized(title),employer:localized(user.company_name),description,opportunityType,group:['job','parttime','freelance'].includes(opportunityType)?'work':'development',category:data.category,closesOn,isRemote:data.workMode==='remote'||data.isRemote===true,workMode:['remote','hybrid','onsite'].includes(data.workMode)?data.workMode:'onsite',wilaya:text(data.wilaya,100)||'Alger',commune:localized(text(data.commune?.fr??data.wilaya,150)||'Alger'),duration:localized(text(data.duration?.fr??data.duration,160)),payAmount:Math.max(0,Math.min(100000000,Number(data.payAmount)||0)),skills:localized(lines(data.skills?.fr??data.skills)),duties:lines(data.duties),profile:lines(data.profile??data.requirements),languages:lines(data.languages),qualities:lines(data.qualities),conditions:lines(data.conditions),schedule:text(data.schedule,500),featured:false,isUrgent:Boolean(data.isUrgent)};
    await database.run('INSERT INTO offers(id,company_id,payload) VALUES (?,?,?)',offer.id,user.company_id,JSON.stringify(offer));
    json(response,201,{offer:{...offer,recruiterAvailable:true}});
  }
  async function apply(request,response,offerId){
    const user=await authenticate(request,'student'),data=await body(request);
    assert(typeof data.message==='string'&&data.message.trim().length>=10&&data.message.length<=2000,400,'invalid_message');
    const offer=await database.get('SELECT o.*,c.owner_id FROM offers o JOIN companies c ON c.id=o.company_id WHERE o.id=?',offerId);assert(offer,404,'offer_not_found');
    assert(JSON.parse(offer.payload).closesOn>=new Date().toISOString().slice(0,10),409,'offer_closed');
    assert(offer.owner_id,409,'recipient_unavailable');
    const id=randomUUID(),createdAt=new Date().toISOString();
    try {await database.run('INSERT INTO applications(id,offer_id,student_id,recruiter_id,message,name,email,created_at) VALUES (?,?,?,?,?,?,?,?)',id,offerId,user.id,offer.owner_id,data.message.trim(),user.name,user.email,createdAt);}
    catch(error){if(error.message.includes('UNIQUE'))throw new ApiError(409,'already_applied');throw error;}
    json(response,201,{application:{id,offerId,status:'pending',createdAt},delivered:true});
  }
  async function applications(request,response){
    const user=await authenticate(request);
    const column=user.role==='recruiter'?'recruiter_id':'student_id';
    const rows=await database.all(`SELECT a.*,o.payload,c.name company_name FROM applications a JOIN offers o ON o.id=a.offer_id JOIN companies c ON c.id=o.company_id WHERE a.${column}=? ORDER BY a.created_at DESC`,user.id);
    const list=rows.map(row=>({id:row.id,offerId:row.offer_id,offerTitle:JSON.parse(row.payload).title?.fr??'',company:row.company_name,name:row.name,email:row.email,message:row.message,status:row.status,createdAt:row.created_at,readAt:row.read_at}));
    json(response,200,{applications:list,unreadCount:user.role==='recruiter'?list.filter(app=>!app.readAt&&app.status!=='withdrawn').length:0});
  }
  async function updateApplication(request,response,id){
    const user=await authenticate(request),data=await body(request);
    const app=await database.get('SELECT * FROM applications WHERE id=?',id);
    assert(app&&(user.role==='recruiter'?app.recruiter_id===user.id:app.student_id===user.id),404,'application_not_found');
    if(data.action==='read'){
      assert(user.role==='recruiter',403,'role_forbidden');
      await database.run('UPDATE applications SET read_at=COALESCE(read_at,?) WHERE id=?',new Date().toISOString(),id);
    }else {
      const allowed=user.role==='recruiter'?['accepted','rejected']:['withdrawn'];assert(allowed.includes(data.status),403,'invalid_status');
      assert(app.status==='pending',409,'application_reviewed');
      await database.run('UPDATE applications SET status=? WHERE id=?',data.status,id);
    }
    json(response,200,{ok:true});
  }
  async function handle(request,response){
    response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('Referrer-Policy','same-origin');response.setHeader('X-Frame-Options','DENY');
    try {
      const url=new URL(request.url,'http://localhost');const path=url.pathname;
      if(path.startsWith('/api/')){
        if(!['GET','HEAD'].includes(request.method)){
          assert(request.headers['x-requested-with']==='StudentJob',403,'same_origin_required');
          const origin=request.headers.origin,expected=publicOrigin??`${secureCookies?'https':'http'}://${request.headers.host}`;
          assert(!origin||origin===expected,403,'same_origin_required');
        }
        if(path==='/api/session'&&request.method==='GET'){const user=await session(request);return json(response,200,{user:user?publicUser(user):null});}
        if(path==='/api/offers'&&request.method==='GET')return json(response,200,{offers:await visibleOffers()});
        if(path==='/api/register'&&request.method==='POST')return await register(request,response);
        if(path==='/api/login'&&request.method==='POST')return await login(request,response);
        if(path==='/api/logout'&&request.method==='POST'){
          const token=request.headers.cookie?.split(';').map(value=>value.trim()).find(value=>value.startsWith('studentjob_session='))?.slice(19);
          if(token)await database.run('DELETE FROM sessions WHERE token=?',digest(token));response.setHeader('Set-Cookie',cookie('',true));return json(response,200,{ok:true});
        }
        if(path==='/api/offers'&&request.method==='POST')return await publish(request,response);
        const applicationPath=path.match(/^\/api\/offers\/([^/]+)\/applications$/);
        if(applicationPath&&request.method==='POST')return await apply(request,response,decodeURIComponent(applicationPath[1]));
        if(path==='/api/applications'&&request.method==='GET')return await applications(request,response);
        const updatePath=path.match(/^\/api\/applications\/([^/]+)$/);
        if(updatePath&&request.method==='PATCH')return await updateApplication(request,response,decodeURIComponent(updatePath[1]));
        throw new ApiError(404,'not_found');
      }
      assert(['GET','HEAD'].includes(request.method),405,'method_not_allowed');
      const relative=decodeURIComponent(path==='/'?'index.html':path.slice(1));
      const allowed=publicFiles.has(relative)||/^(assets|i18n)\/[\w./-]+\.(js|css|svg|png|woff2)$/.test(relative);
      assert(allowed&&!relative.split('/').includes('..'),404,'not_found');
      let data=await readFile(resolve(root,relative));if(extname(relative)==='.html')data=Buffer.from(data.toString().replace('</head>','<meta name="studentjob-live" content="true"></head>'));response.writeHead(200,{'Content-Type':mime[extname(relative)]??'application/octet-stream','Cache-Control':'no-cache'});response.end(request.method==='HEAD'?undefined:data);
    }catch(error){json(response,error.status??(error.code==='ENOENT'?404:500),{error:error instanceof ApiError?error.code:error.code==='ENOENT'?'not_found':'server_error'});}
  }
  const server=createServer((request,response)=>{void handle(request,response);});
  return {
    server,database,
    async listen(port=3000,host='0.0.0.0'){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});return server.address();},
    async close(){await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));await database.close();},
    async invite(companyId){let company=await database.get('SELECT * FROM companies WHERE id=?',companyId);if(!company){const offer=await database.get('SELECT company_id FROM offers WHERE id=?',companyId);if(offer)company=await database.get('SELECT * FROM companies WHERE id=?',offer.company_id);}assert(company&&!company.owner_id,409,'company_unavailable');const token=randomBytes(24).toString('hex');await database.run('INSERT INTO invitations(token,company_id,expires_at) VALUES (?,?,?)',digest(token),company.id,Date.now()+24*60*60*1000);return token;}
  };
}
