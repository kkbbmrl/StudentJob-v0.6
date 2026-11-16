import {Worker} from 'node:worker_threads';

/** SQLite runs in a worker, keeping database I/O off the HTTP event loop. */
export async function openDatabase(filename){
  const worker=new Worker(new URL('./database-worker.mjs',import.meta.url),{workerData:{filename}});
  const pending=new Map();let sequence=0;
  await new Promise((resolve,reject)=>{
    worker.once('message',resolve);worker.once('error',reject);
  });
  worker.on('message',({id,result,error})=>{
    const request=pending.get(id);if(!request)return;
    pending.delete(id);if(error)request.reject(new Error(error));else request.resolve(result);
  });
  worker.on('error',error=>{pending.forEach(request=>request.reject(error));pending.clear();});
  const batch=async(operations,transaction=false)=>await new Promise((resolve,reject)=>{
    const id=++sequence;pending.set(id,{resolve,reject});worker.postMessage({id,operations,transaction});
  });
  return {
    batch,
    async get(sql,...parameters){return (await batch([{sql,parameters,kind:'get'}]))[0]??null;},
    async all(sql,...parameters){return (await batch([{sql,parameters,kind:'all'}]))[0];},
    async run(sql,...parameters){return (await batch([{sql,parameters}]))[0];},
    async close(){await worker.terminate();}
  };
}
