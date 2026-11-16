const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const home=pathToFileURL(path.resolve('index.html')).href;

test('header fits all requested widths for recruiters and Arabic readers',async({page})=>{
  await page.goto(home);
  await page.evaluate(()=>localStorage.setItem('jobetudiant_role','recruiter'));
  await page.reload();
  for(const width of [360,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.locator('[data-lang=ar]').click();
  for(const width of [360,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('dialog traps keyboard focus, restores it, and hides inactive controls',async({page})=>{
  await page.goto(home);
  const opener=page.locator('#login-btn');
  await opener.click();
  const dialog=page.locator('#login-modal');
  await dialog.locator('button').last().focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>document.activeElement.closest('[role=dialog]')?.id)).toBe('login-modal');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(dialog).toBeHidden();
  expect(await page.locator('#marquee-track-2').evaluate(e=>e.inert)).toBe(true);
});

test('mobile workspace tables retain labels without horizontal scrolling',async({page})=>{
  await page.setViewportSize({width:360,height:900});
  await page.goto(home+'?workspace=1');
  for(const role of ['student','recruiter','admin']){
    await page.locator('#ws-role').selectOption(role);
    await page.locator('.ws-sidebar [data-tab="'+(role==='admin'?'moderation':'applications')+'"]').click();
    expect(await page.locator('.ws-table-wrap').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    await expect(page.locator('.ws-table-wrap td[data-label]').first()).toBeVisible();
  }
});
