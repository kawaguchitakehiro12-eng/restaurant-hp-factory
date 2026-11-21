import 'server-only';
import type {ImageWorkflow} from './workflow';
import {migrateImages} from './migrate';
/** Production caller must supply durable migration journal + existing content CAS. */
export async function saveImageContent(input:{content:unknown;actor:string;site:string;revision:string;workflow:ImageWorkflow;journal:Map<string,string>;url:(id:string)=>string;stage?:(content:unknown)=>Promise<void>;commit:(content:unknown,revision:string)=>Promise<boolean>}){
 const prepared=await migrateImages(input.content,input.actor,input.site,input.workflow,input.journal,input.url);
 if(input.stage)await input.stage(prepared);
 if(!await input.commit(prepared,input.revision))throw Error('MEDIA_CONTENT_CONFLICT');
 return prepared;
}
