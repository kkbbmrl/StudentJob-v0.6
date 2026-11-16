import {createApplication} from './app.mjs';

const application=await createApplication();
if(process.argv[2]==='invite'){
  try{const token=await application.invite(process.argv[3]);console.log(`One-use recruiter invitation (expires in 24 hours): ${token}`);}
  finally{await application.database.close();}
}else {
  const port=Number(process.env.PORT??3000);
  await application.listen(port,process.env.HOST??'0.0.0.0');
  console.log(`StudentJob server: http://localhost:${port}`);
  const close=async()=>{await application.close();process.exitCode=0;};
  process.once('SIGINT',()=>{void close();});process.once('SIGTERM',()=>{void close();});
}
