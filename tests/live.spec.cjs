const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:3107';
test.setTimeout(45000);

async function register(page,role,email,company){
 await page.goto(base+'/index.html');await page.waitForFunction(()=>window.LiveApp?.enabled);
 await page.locator('#login-btn').click();await page.locator('[data-live-action=auth-mode]').click();
 const form=page.locator('#live-auth-form');
 await form.locator('[name=name]').fill(role==='recruiter'?'Karim Recruiter':'Yasmine Applicant');
 await form.locator('[name=role]').selectOption(role);
 if(company)await form.locator('[name=company]').fill(company);
 await form.locator('[name=email]').fill(email);await form.locator('[name=password]').fill('test-password-123');
 await form.locator('[type=submit]').click();await expect(page.locator('.live-tabs')).toBeVisible();
}

test('a message crosses separate browsers and only its recruiter receives it',async({browser})=>{
 const recruiterContext=await browser.newContext({locale:'fr-FR'}),studentContext=await browser.newContext({locale:'fr-FR'}),otherContext=await browser.newContext({locale:'fr-FR'});
 const recruiter=await recruiterContext.newPage(),student=await studentContext.newPage(),other=await otherContext.newPage();
 const unique=Date.now();
 await register(recruiter,'recruiter','recruiter-'+unique+'@example.test','Actual employer');
 await recruiter.locator('[data-live-tab=publish]').click();const form=recruiter.locator('#live-offer-form');
 await form.locator('[name=title]').fill('Real delivered application '+unique);await form.locator('[name=description]').fill('Build accessible applications with our team.');
 await form.locator('[name=wilaya]').fill('Alger');await form.locator('[name=duration]').fill('6 months');await form.locator('[name=closesOn]').fill('2030-12-31');await form.locator('[type=submit]').click();
 const href=await recruiter.locator('#live-content .mission-detail-link').first().getAttribute('href');
 await recruiter.locator('[data-live-tab=applications]').click();await expect(recruiter.locator('#live-content')).toContainText('Aucune candidature');
 await register(student,'student','student-'+unique+'@example.test');await student.locator('[data-live-action=close]').click();
 await student.goto(base+'/'+href);await student.waitForFunction(()=>window.LiveApp?.user?.role==='student');
 const companyHref=await student.locator('.op-company-line').getAttribute('href');
 await student.locator('#offer-apply').click();
 const message='Je suis disponible ce week-end.\nMon message complet <script>window.messageExecuted=true</script> doit arriver au recruteur.';
 await student.locator('[name=message]').fill(message);await student.locator('#offer-application [type=submit]').click();
 await expect(student.locator('#offer-status')).toContainText('reçus dans la boîte du recruteur');
 await expect(recruiter.locator('.live-application')).toHaveCount(1,{timeout:10000});
 await recruiter.locator('.live-message summary').click();await expect(recruiter.locator('.live-message-body')).toHaveText(message);
 await expect(recruiter.locator('.live-application-meta')).toContainText('student-'+unique+'@example.test');expect(await recruiter.evaluate(()=>window.messageExecuted)).toBeUndefined();
 await recruiter.reload();await recruiter.waitForFunction(()=>window.LiveApp?.user?.role==='recruiter');await recruiter.locator('#login-btn').click();await expect(recruiter.locator('.live-application')).toHaveCount(1);await recruiter.locator('.live-message summary').click();await expect(recruiter.locator('.live-message-body')).toHaveText(message);
 await register(other,'recruiter','stranger-'+unique+'@example.test','Another employer');await expect(other.locator('.live-application')).toHaveCount(0);
 await recruiter.locator('[data-review=accepted]').click();await expect(recruiter.locator('.live-application .ws-badge').first()).toHaveText('Acceptée');
 await student.goto(base+'/index.html?workspace=1');await expect(student.locator('.live-application .ws-badge').first()).toHaveText('Acceptée');
 await student.goto(base+'/'+companyHref);await expect(student.locator('h1')).toHaveText('Actual employer');await expect(student.locator('.company-status')).toContainText('non vérifiée');
 await recruiterContext.close();await studentContext.close();await otherContext.close();
});

test('a failed send preserves the draft and does not claim delivery',async({page})=>{
 const unique=Date.now();await register(page,'student','failure-'+unique+'@example.test');await page.locator('[data-live-action=close]').click();
 await page.goto(base+'/offer.html?id=mis_001');await page.waitForFunction(()=>window.LiveApp?.user?.role==='student');
 await page.locator('#offer-apply').click();await expect(page.locator('#offer-status')).toContainText('pas encore de recruteur inscrit');await expect(page.locator('#offer-application')).toBeHidden();
});

test('a network failure retains the message for a successful retry',async({page,request})=>{
 const unique=Date.now(),headers={'X-Requested-With':'StudentJob'};
 await request.post(base+'/api/register',{headers,data:{name:'Network recruiter',email:'network-recruiter-'+unique+'@example.test',password:'test-password-123',role:'recruiter',company:'Network employer'}});
 const response=await request.post(base+'/api/offers',{headers,data:{title:'Retry offer',description:'Work with our team to improve student applications.',category:'tech',opportunityType:'job',closesOn:'2030-12-31',duration:'One month',wilaya:'Alger'}});
 const {offer}=await response.json();
 await register(page,'student','network-student-'+unique+'@example.test');await page.locator('[data-live-action=close]').click();
 await page.goto(base+'/offer.html?id='+offer.id);await page.waitForFunction(()=>window.LiveApp?.user?.role==='student');await page.locator('#offer-apply').click();
 const message='Please retain my complete application message after a network failure.';
 await page.locator('[name=message]').fill(message);
 await page.route('**/api/offers/*/applications',route=>route.abort());
 await page.locator('#offer-application [type=submit]').click();
 await expect(page.locator('#offer-status')).toHaveAttribute('data-error','true');
 await expect(page.locator('[name=message]')).toHaveValue(message);
 await expect(page.locator('#offer-application [type=submit]')).toBeEnabled();
 await page.unroute('**/api/offers/*/applications');
 await page.locator('#offer-application [type=submit]').click();
 await expect(page.locator('#offer-status')).toContainText('reçus dans la boîte du recruteur');
});
