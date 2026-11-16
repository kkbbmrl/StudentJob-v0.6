import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

/** Load the existing public demo records without browser state or mutations. */
export async function seedDatabase(database){
  const context={window:{},localStorage:{getItem:()=>null},Intl,Date};
  vm.createContext(context);
  vm.runInContext(await readFile(new URL('../offers-data.js',import.meta.url),'utf8'),context);
  const store=context.window.OfferStore;
  const operations=store.companies().map(company=>({sql:'INSERT OR IGNORE INTO companies(id,name) VALUES (?,?)',parameters:[company.id,company.name]}));
  store.all().forEach(offer=>operations.push({sql:'INSERT OR IGNORE INTO offers(id,company_id,payload) VALUES (?,?,?)',parameters:[offer.id,offer.companyId,JSON.stringify(offer)]}));
  await database.batch(operations,true);
}
