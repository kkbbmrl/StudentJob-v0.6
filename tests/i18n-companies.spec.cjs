const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const route=name=>pathToFileURL(path.resolve(name)).href;

test('language persists across pages and updates document direction without leaving the route',async({page})=>{
 await page.goto(route('index.html'));
 await page.locator('[data-language=en]').first().click();
 await page.goto(route('companies.html'));
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('h1')).toHaveText('Discover companies that help talent grow.');
 await expect(page.locator('#company-filters')).not.toContainText(/Localisation|Tous les secteurs|Réinitialiser/);
 const url=page.url();await page.locator('[data-language=ar]').first().click();
 await expect(page).toHaveURL(url);await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.goto(route('404.html'));
 await expect(page.locator('h1')).toHaveText('الصفحة غير موجودة');
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await page.locator('[data-language=fr]').first().click();await page.reload();
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
});

for(const language of ['fr','en','ar'])test('company cards, toolbar and profile adapt in '+language,async({page})=>{
 await page.goto(route('companies.html'));await page.locator('[data-language='+language+']').first().click();
 for(const width of [360,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const heights=await page.locator('#company-filters .input-field').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));expect(heights).toEqual([48,48,48,48]);
  if(width>=768){const heights=await page.locator('.company-card').evaluateAll(es=>es.slice(0,2).map(e=>e.getBoundingClientRect().height));expect(Math.abs(heights[0]-heights[1])).toBeLessThan(1);}
 }
 await page.locator('#company-name').fill('InnovDigital');await expect(page.locator('.company-card')).toHaveCount(1);
 await page.locator('.company-actions a').click();
 await expect(page.locator('h1')).toHaveText('InnovDigital');
 await expect(page.locator('#company-offers .mission-card')).not.toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('zero-offer companies and missing logos use accessible fallbacks',async({page})=>{
 await page.goto(route('companies.html'));
 await page.evaluate(()=>{
  const companies=OfferStore.companies,all=companies();
  OfferStore.companies=()=>all.map(c=>({...c,name:c.id==='innovdigital'?'A very long company name '.repeat(10):c.name,logo:'missing-logo.png'}));
  localStorage.setItem('jobetudiant_workspace',JSON.stringify({hidden:OfferStore.all().map(o=>o.id),paused:[]}));
  I18n.setLanguage('en');
 });
 await expect(page.locator('.company-card').first()).toBeVisible();
 await expect.poll(()=>page.locator('[data-company-logo]').first().evaluate(e=>e.hidden)).toBe(true);
 await page.setViewportSize({width:360,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto(route('companies.html')+'?id=innovdigital');
 await expect(page.locator('#company-offers')).toContainText('No open offers at the moment.');
});

test('workspace language changes retain the current role, tab and draft profile',async({page})=>{
 await page.goto(route('index.html')+'?workspace=1');
 for(const role of ['student','recruiter','admin']){
  await page.locator('#ws-role').selectOption(role);await page.locator('.ws-sidebar [data-tab=profile]').click();
  await page.locator('[name=bio]').fill('My unchanged draft');
  await page.locator('#workspace [data-language=en]').click();
  await expect(page.locator('[name=bio]')).toHaveValue('My unchanged draft');
  await expect(page.locator('#ws-profile-form')).toContainText('Personal information');
  await expect(page.locator('#ws-role')).toHaveValue(role);
  await page.locator('#workspace [data-language=fr]').click();
 }
});


test('browser language is used when storage is unavailable',async({browser})=>{
 const context=await browser.newContext({locale:'en-GB'});
 await context.addInitScript(()=>{Storage.prototype.getItem=function(){throw new Error('storage unavailable');};Storage.prototype.setItem=function(){throw new Error('storage unavailable');};});
 const page=await context.newPage();await page.goto(route('companies.html'));
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('h1')).toHaveText('Discover companies that help talent grow.');
 await page.locator('[data-language=ar]').click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await context.close();
});


test('an English offer load can switch all headings and metadata directly to Arabic',async({browser})=>{
 const context=await browser.newContext({locale:'en-GB'});const page=await context.newPage();
 await page.goto(route('offer.html')+'?id=offer-internship');
 await expect(page).toHaveTitle(/Internship/);
 await page.locator('[data-language=ar]').click();
 await expect(page.locator('.op-description h2').first()).toHaveText('حول هذا العرض');
 await expect(page.locator('.op-description section').first()).toHaveAttribute('aria-label','المهام والمسؤوليات');
 expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(await page.title());
 await context.close();
});
