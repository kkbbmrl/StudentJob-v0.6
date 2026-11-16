import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createApplication} from './app.mjs';

const directory=await mkdtemp(join(tmpdir(),'studentjob-e2e-'));
const app=await createApplication({databasePath:join(directory,'test.sqlite')});
await app.listen(3107,'127.0.0.1');
const close=async()=>{
  await app.close();
  if(resolve(directory).startsWith(resolve(tmpdir(),'studentjob-e2e-')))await rm(directory,{recursive:true,force:true});
};
process.once('SIGTERM',()=>{void close();});process.once('SIGINT',()=>{void close();});
