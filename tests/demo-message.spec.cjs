const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

test('demo application message survives applying before the workspace exists',async({page})=>{
 await page.goto(pathToFileURL(path.resolve('offer.html')).href+'?id=mis_001');
 await page.locator('#offer-apply').click();
 await page.locator('[name=name]').fill('Demo sender');
 await page.locator('[name=email]').fill('demo-sender@example.test');
 const message='Voici mon message complet pour cette offre de soutien scolaire.';
 await page.locator('[name=message]').fill(message);await page.locator('#offer-application [type=submit]').click();
 await page.goto(pathToFileURL(path.resolve('index.html')).href+'?workspace=1');
 await page.locator('#ws-role').selectOption('recruiter');
 const row=page.locator('.ws-table-wrap tr').filter({hasText:'Demo sender'});await row.locator('summary').click();
 await expect(row).toContainText(message);await expect(row).toContainText('demo-sender@example.test');
});
