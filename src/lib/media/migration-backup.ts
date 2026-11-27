import 'server-only';
import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
export interface BackupStore {readBackup(id:string):Promise<Uint8Array|null>;putBackup(id:string,bytes:Uint8Array):Promise<void>}
function key(secret:string){if(!/^[a-f0-9]{64}$/.test(secret))throw Error('MEDIA_BACKUP_KEY');return Buffer.from(secret,'hex');}
export function decryptMigrationBackup(bytes:Uint8Array,secret:string){try{if(bytes.length>8000000||bytes.length<29)throw Error();const b=Buffer.from(bytes),d=createDecipheriv('aes-256-gcm',key(secret),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(gunzipSync(Buffer.concat([d.update(b.subarray(28)),d.final()]),{maxOutputLength:8000000}).toString('utf8')) as unknown;}catch{throw Error('MEDIA_BACKUP_INVALID');}}
export async function ensureMigrationBackup(id:string,value:unknown,store:BackupStore,secret:string){const plain=JSON.stringify(value),sha=createHash('sha256').update(plain).digest('hex');let bytes=await store.readBackup(id);if(!bytes){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key(secret),iv),encrypted=Buffer.concat([c.update(gzipSync(plain)),c.final()]);bytes=Buffer.concat([iv,c.getAuthTag(),encrypted]);await store.putBackup(id,bytes);bytes=await store.readBackup(id);}
 if(!bytes||JSON.stringify(decryptMigrationBackup(bytes,secret))!==plain)throw Error('MEDIA_BACKUP_VERIFY');return {key:'legacy/'+id+'.bin',sha};}
