import {DatabaseSync} from 'node:sqlite';
import {parentPort,workerData} from 'node:worker_threads';

const database=new DatabaseSync(workerData.filename);
database.exec(`
 PRAGMA journal_mode=WAL;
 PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS companies(id TEXT PRIMARY KEY,name TEXT NOT NULL,owner_id TEXT UNIQUE);
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('student','recruiter')),company_id TEXT REFERENCES companies(id));
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS offers(id TEXT PRIMARY KEY,company_id TEXT NOT NULL REFERENCES companies(id),payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS applications(id TEXT PRIMARY KEY,offer_id TEXT NOT NULL REFERENCES offers(id),student_id TEXT NOT NULL REFERENCES users(id),recruiter_id TEXT NOT NULL REFERENCES users(id),message TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,read_at TEXT,UNIQUE(offer_id,student_id));
 CREATE TABLE IF NOT EXISTS invitations(token TEXT PRIMARY KEY,company_id TEXT NOT NULL REFERENCES companies(id),expires_at INTEGER NOT NULL,used_at TEXT);
 CREATE INDEX IF NOT EXISTS application_recipient ON applications(recruiter_id,created_at);
 CREATE INDEX IF NOT EXISTS application_student ON applications(student_id,created_at);
`);
parentPort.postMessage({ready:true});
parentPort.on('message',({id,operations,transaction})=>{
  try {
    if(transaction)database.exec('BEGIN IMMEDIATE');
    const result=operations.map(({sql,parameters=[],kind='run',expectChanges})=>{const value=database.prepare(sql)[kind](...parameters);if(expectChanges!==undefined&&Number(value.changes)!==expectChanges)throw new Error('concurrent_update');return value;});
    if(transaction)database.exec('COMMIT');
    parentPort.postMessage({id,result});
  } catch(error){
    if(transaction)database.exec('ROLLBACK');
    parentPort.postMessage({id,error:error.message});
  }
});
