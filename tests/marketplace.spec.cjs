const {test,expect}=require('@playwright/test');const {pathToFileURL}=require('node:url');const path=require('node:path');
for(const language of ['fr','en','ar'])test('marketplace controls, media and header fit in '+language,async({page})=>{
 await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.locator('[data-lang='+language+']').click();
 for(const width of [360,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,heights:[...document.querySelectorAll('.marketplace .input-field,#reset-filters-btn')].map(e=>e.getBoundingClientRect().height),edges:[document.querySelector('.header-inner'),document.querySelector('#missions>.container')].map(e=>[e.getBoundingClientRect().left,e.getBoundingClientRect().right]),header:[...document.querySelectorAll('.marketplace-header .saved-counter-btn,.marketplace-header .lang-switcher')].map(e=>e.getBoundingClientRect().height)}));
  expect(metrics.overflow).toBe(false);expect(metrics.heights.every(h=>h===48)).toBe(true);expect(metrics.edges[0]).toEqual(metrics.edges[1]);expect(metrics.header).toEqual([48,48]);
  if(width===360){const bounds=await page.locator('.toolbar-top-row>div').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));expect(Math.max(...bounds)-Math.min(...bounds)).toBeLessThan(1);}
 }
 await expect(page.locator('.mission-media')).toHaveCount(13);
 await page.locator('.mission-media').first().evaluate(e=>e.src='missing-image.png');
 await expect.poll(()=>page.locator('.mission-media').first().evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
 await page.locator('.mission-title a').first().evaluate(e=>e.textContent='A very long offer title '.repeat(30));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const media=await page.locator('.mission-media').first().boundingBox();expect(media.width/media.height).toBeCloseTo(1.6,1);
});
