const {test,expect}=require('@playwright/test');const {pathToFileURL}=require('node:url');const path=require('node:path');
test('offer dossier facts and actions remain readable and localized',async({page})=>{
 await page.goto(pathToFileURL(path.resolve('offer.html')).href+'?id=mis_001');
 await expect(page.locator('.op-key-facts .offer-fact')).toHaveCount(3);
 await expect(page.locator('.op-description section h2 .icon')).toHaveCount(5);
 await page.locator('[data-language=ar]').click();await page.locator('[data-language=fr]').click();
 await expect(page.locator('.offer-company-link')).toContainText('Toutes les offres');
 expect(await page.locator('.offer-compensation').innerText()).not.toMatch(/[\u0600-\u06ff]/);
 for(const width of [360,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:360,height:900});
 const positions=await page.evaluate(()=>({actions:document.querySelector('.offer-action-panel').getBoundingClientRect().top,description:document.querySelector('.offer-description').getBoundingClientRect().top}));expect(positions.actions).toBeLessThan(positions.description);
 await page.locator('#share-offer').click();await expect(page.locator('#share-url')).toBeVisible();
 await page.locator('#offer-apply').click();await expect(page.locator('#offer-application')).toBeVisible();
 await page.locator('#cancel-application').click();await expect(page.locator('#application-section')).toBeHidden();
});
