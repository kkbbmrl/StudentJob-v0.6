import {beforeEach,afterEach,test,expect} from '@jest/globals';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApplication} from '../server/app.mjs';

let app,base;
beforeEach(async()=>{app=await createApplication({databasePath:':memory:'});const address=await app.listen(0,'127.0.0.1');base='http://127.0.0.1:'+address.port;});
afterEach(async()=>{await app.close();});
function client(){let cookie='';return async(path,method='GET',body,headers={})=>{
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json','X-Requested-With':'StudentJob',Origin:base,Cookie:cookie,...headers},body:body===undefined?undefined:JSON.stringify(body)});
 const received=response.headers.get('set-cookie');if(received)cookie=received.split(';')[0];
 const content=await response.text();let data;try{data=JSON.parse(content);}catch{data=content;}
 return {status:response.status,data,headers:response.headers};
};}
const signup=(request,role='student',extra={})=>request('/api/register','POST',{name:'Application tester',email:role+'@example.test',password:'test-password-123',role,company:'Recruiter Company',...extra});
const payload={title:'Student web developer',description:'Build accessible web interfaces with the team.',category:'tech',opportunityType:'internship',closesOn:'2030-12-31',duration:'6 months',wilaya:'Alger',workMode:'hybrid',payAmount:18000,duties:['Build interfaces'],profile:['Student'],skills:['JavaScript'],languages:['English'],qualities:['Curiosity'],conditions:['Hybrid'],schedule:'Weekdays'};
async function offer(request){const result=await request('/api/offers','POST',payload);expect(result.status).toBe(201);return result.data.offer;}

test('full messages reach only the offer owner across separate sessions',async()=>{
 const recruiter=client(),student=client(),stranger=client();await signup(recruiter,'recruiter');await signup(student);await signup(stranger,'recruiter',{email:'other@example.test'});
 const job=await offer(recruiter);const message='Available this weekend. <script>alert("x")</script>\nI have relevant experience.';
 const sent=await student('/api/offers/'+job.id+'/applications','POST',{message,name:'Spoofed',email:'spoof@example.test',recruiterId:'wrong'});
 expect(sent.status).toBe(201);expect(sent.data.delivered).toBe(true);
 const inbox=await recruiter('/api/applications');expect(inbox.data.unreadCount).toBe(1);expect(inbox.data.applications[0]).toMatchObject({message,name:'Application tester',email:'student@example.test',offerId:job.id});
 const id=inbox.data.applications[0].id;
 expect((await stranger('/api/applications')).data.applications).toEqual([]);
 expect((await stranger('/api/applications/'+id,'PATCH',{action:'read'})).status).toBe(404);
 expect((await student('/api/applications/'+id,'PATCH',{action:'read'})).status).toBe(403);
 expect((await recruiter('/api/applications/'+id,'PATCH',{action:'read'})).status).toBe(200);
 expect((await recruiter('/api/applications')).data.unreadCount).toBe(0);
 expect((await recruiter('/api/applications/'+id,'PATCH',{status:'accepted'})).status).toBe(200);
 expect((await student('/api/applications')).data.applications[0].status).toBe('accepted');
 expect((await recruiter('/api/applications/'+id,'PATCH',{status:'rejected'})).status).toBe(409);
 expect((await student('/api/offers/'+job.id+'/applications','POST',{message})).data.error).toBe('already_applied');
});

test('authentication and company ownership cannot be supplied by the browser',async()=>{
 const anonymous=client();expect((await anonymous('/api/session')).data.user).toBeNull();expect((await anonymous('/api/applications')).status).toBe(401);
 expect((await signup(anonymous,'admin')).status).toBe(400);
 expect((await signup(anonymous,'student',{name:'x',email:'invalid'})).status).toBe(400);
 expect((await signup(anonymous,'student',{password:'short'})).status).toBe(400);
 expect((await signup(anonymous,'recruiter',{company:''})).status).toBe(400);
 expect((await signup(anonymous,'recruiter',{invitation:'invalid'})).data.error).toBe('invalid_invitation');
 expect((await signup(anonymous)).status).toBe(201);
 expect((await signup(client())).status).toBe(409);
 expect((await anonymous('/api/offers','POST',payload)).status).toBe(403);
 expect((await anonymous('/api/logout','POST',{})).status).toBe(200);
 expect((await anonymous('/api/session')).data.user).toBeNull();
 expect((await anonymous('/api/login','POST',{email:'student@example.test',password:'wrong'})).status).toBe(401);
 expect((await anonymous('/api/login','POST',{email:'missing@example.test',password:'wrong'})).status).toBe(401);
 expect((await anonymous('/api/login','POST',{email:'student@example.test',password:4})).status).toBe(400);
 const login=await anonymous('/api/login','POST',{email:'student@example.test',password:'test-password-123'});expect(login.status).toBe(200);expect(login.headers.get('set-cookie')).toMatch(/HttpOnly; SameSite=Lax/);
 expect(login.data.user.password).toBeUndefined();
});

test('messages are validated and never marked sent to missing or closed recipients',async()=>{
 const recruiter=client(),student=client();await signup(recruiter,'recruiter');await signup(student);const job=await offer(recruiter);
 expect((await recruiter('/api/offers/'+job.id+'/applications','POST',{message:'Recruiter must not apply'})).status).toBe(403);
 for(const message of ['',5,'x'.repeat(2001)])expect((await student('/api/offers/'+job.id+'/applications','POST',{message})).status).toBe(400);
 expect((await student('/api/offers/missing/applications','POST',{message:'Valid application message'})).status).toBe(404);
 expect((await student('/api/offers/mis_001/applications','POST',{message:'Valid application message'})).data.error).toBe('recipient_unavailable');
 await app.database.run('UPDATE offers SET payload=? WHERE id=?',JSON.stringify({...job,closesOn:'2020-01-01'}),job.id);
 expect((await student('/api/offers/'+job.id+'/applications','POST',{message:'Valid application message'})).data.error).toBe('offer_closed');
 expect((await recruiter('/api/applications')).data.applications).toEqual([]);
});

test('students can withdraw their own pending applications and recruiters can decline',async()=>{
 const recruiter=client(),student=client();await signup(recruiter,'recruiter');await signup(student);const job=await offer(recruiter);
 const applied=await student('/api/offers/'+job.id+'/applications','POST',{message:'Please consider my application.'});const id=applied.data.application.id;
 expect((await student('/api/applications/'+id,'PATCH',{status:'accepted'})).status).toBe(403);
 expect((await recruiter('/api/applications/'+id,'PATCH',{status:'withdrawn'})).status).toBe(403);
 expect((await student('/api/applications/'+id,'PATCH',{status:'withdrawn'})).status).toBe(200);
 expect((await recruiter('/api/applications')).data.applications[0].status).toBe('withdrawn');
 const next=await offer(recruiter);const second=await student('/api/offers/'+next.id+'/applications','POST',{message:'Please consider my other application.'});
 expect((await recruiter('/api/applications/'+second.data.application.id,'PATCH',{status:'rejected'})).status).toBe(200);
});

test('private invitations assign existing sample companies and are one-use',async()=>{
 const invitation=await app.invite('innovdigital');const recruiter=client();
 expect((await signup(recruiter,'recruiter',{invitation})).status).toBe(201);
 const user=(await recruiter('/api/session')).data.user;expect(user.companyId).toBe('innovdigital');
 const offers=(await recruiter('/api/offers')).data.offers;expect(offers.find(item=>item.id==='offer-internship').recruiterAvailable).toBe(true);
 expect((await signup(client(),'recruiter',{email:'second@example.test',invitation})).status).toBe(400);
 await expect(app.invite('innovdigital')).rejects.toThrow('company_unavailable');await expect(app.invite('missing')).rejects.toThrow('company_unavailable');
 const student=client();await signup(student);expect((await student('/api/offers/offer-internship/applications','POST',{message:'My actual message to InnovDigital.'})).status).toBe(201);
 expect((await recruiter('/api/applications')).data.applications[0].message).toBe('My actual message to InnovDigital.');
});

test('offer validation keeps client-supplied company and owner values out of routing',async()=>{
 const recruiter=client();const registration=await signup(recruiter,'recruiter');
 for(const invalid of [{title:''},{description:'x'},{opportunityType:'bad'},{closesOn:'yesterday'},{closesOn:'2020-01-01'},{category:'bad'}])expect((await recruiter('/api/offers','POST',{...payload,...invalid})).status).toBe(400);
 const result=await recruiter('/api/offers','POST',{...payload,companyId:'innovdigital',owner:'someone-else',isRemote:true,payAmount:-100,skills:'JS\nHTML',duties:'Build\nTest',languages:undefined,workMode:'bad',title:{fr:'New offer'},duration:{fr:'Six weeks'}});
 expect(result.status).toBe(201);expect(result.data.offer.owner).toBe(registration.data.user.id);expect(result.data.offer.companyId).toBe(registration.data.user.companyId);expect(result.data.offer.payAmount).toBe(0);
});

test('HTTP boundaries reject cross-origin writes and private source files',async()=>{
 const request=client();expect((await request('/api/register','POST',{}, {Origin:'https://attacker.example'})).status).toBe(403);
 expect((await request('/api/register','POST',{}, {'X-Requested-With':''})).status).toBe(403);
 expect((await request('/api/register','POST',{}, {'Content-Type':'text/plain'})).status).toBe(415);
 expect((await request('/api/register','POST',[])).status).toBe(400);
 expect((await request('/api/register','POST',{message:'x'.repeat(40000)})).status).toBe(413);
 const malformed=await fetch(base+'/api/register',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'StudentJob'},body:'not json'});expect(malformed.status).toBe(400);
 for(const path of ['/server/app.mjs','/.data/studentjob.sqlite','/tests/server.test.mjs','/unknown.html','/api/missing'])expect((await request(path)).status).toBe(404);
 const page=await request('/');expect(page.status).toBe(200);expect(page.data).toContain('studentjob-live');
 expect((await request('/index.html','HEAD')).status).toBe(200);expect((await request('/index.html','POST',{})).status).toBe(405);
 expect((await request('/assets/illustrations/missing.svg')).status).toBe(404);expect((await request('/tokens.css')).headers.get('content-type')).toContain('text/css');
});

test('account and message data survive a server restart',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'studentjob-persistence-'));await app.close();app=await createApplication({databasePath:join(directory,'test.sqlite')});let address=await app.listen(0,'127.0.0.1');base='http://127.0.0.1:'+address.port;
 const recruiter=client(),student=client();await signup(recruiter,'recruiter');await signup(student);const job=await offer(recruiter);await student('/api/offers/'+job.id+'/applications','POST',{message:'This message must survive restarting.'});
 await app.close();app=await createApplication({databasePath:join(directory,'test.sqlite')});address=await app.listen(0,'127.0.0.1');base='http://127.0.0.1:'+address.port;
 expect((await recruiter('/api/applications')).data.applications[0].message).toBe('This message must survive restarting.');
 await rm(directory,{recursive:true,force:true}).catch(()=>{});
});

test('secure cookies are opt-in for an HTTPS deployment',async()=>{
 await app.close();app=await createApplication({databasePath:':memory:',secureCookies:true,publicOrigin:'https://jobs.example.test'});const address=await app.listen(0,'127.0.0.1');base='http://127.0.0.1:'+address.port;
 const response=await client()('/api/register','POST',{name:'Secure student',email:'secure@example.test',password:'test-password-123',role:'student'},{Origin:'https://jobs.example.test'});expect(response.headers.get('set-cookie')).toContain('Secure');
});

test('auth attempts are limited and database transactions roll back',async()=>{
 const request=client();for(let i=0;i<30;i+=1)await request('/api/login','POST',{password:3});expect((await request('/api/login','POST',{password:3})).status).toBe(429);
 await expect(app.database.batch([{sql:'INSERT INTO companies(id,name) VALUES (?,?)',parameters:['rollback','Rollback']},{sql:'UPDATE companies SET owner_id=? WHERE id=?',parameters:['x','missing'],expectChanges:1}],true)).rejects.toThrow('concurrent_update');
 expect(await app.database.get('SELECT * FROM companies WHERE id=?','rollback')).toBeNull();
});
