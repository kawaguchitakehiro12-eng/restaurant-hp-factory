import 'server-only';
import {randomUUID,createHash} from 'node:crypto';
import {compressImage} from './compress';
import {identifier,objectKey,STORE_LIMIT,type MetadataStore,type ObjectStore,type Policy} from './model';
export class ImageWorkflow {
 constructor(private metadata:MetadataStore,private objects:ObjectStore,private authorize:(actor:string,site:string)=>Promise<boolean>,private clock=Date.now){}
 private async check(actor:string,site:string){identifier(site);if(!await this.authorize(actor,site))throw Error('MEDIA_DENIED');}
 async verify(actor:string,site:string,id:string){await this.check(actor,site);const a=(await this.metadata.read(site)).assets.find(a=>a.id===id&&a.state==='ready');if(!a)throw Error('MEDIA_NOT_READY');const bytes=await this.objects.get(a.key);if(!bytes||bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.hash)throw Error('MEDIA_VERIFY');return a;}
 async upload(actor:string,site:string,input:Uint8Array,mime:string,logo=false){
 await this.check(actor,site);const result=await compressImage(input,mime,logo),id=randomUUID(),key=objectKey(site,id);
 const prior=(await this.metadata.read(site)).assets.find(a=>a.state==='ready'&&a.hash===result.hash);if(prior)return prior;
 await this.metadata.transaction(site,s=>{if(s.assets.reduce((n,a)=>n+a.bytes,0)+result.bytes.length>STORE_LIMIT)throw Error('MEDIA_QUOTA');s.assets.push({id,site,key,bytes:result.bytes.length,format:result.format,width:result.width,height:result.height,hash:result.hash,state:'reserved',created:this.clock()});});
 try{await this.objects.put(key,result.bytes,'image/webp');const actual=await this.objects.get(key);if(!actual||createHash('sha256').update(actual).digest('hex')!==result.hash)throw Error('MEDIA_VERIFY');
 return await this.metadata.transaction(site,s=>{const a=s.assets.find(a=>a.id===id);if(!a||a.state!=='reserved')throw Error('MEDIA_CONFLICT');a.state='ready';s.revision++;return a;});
 }catch{await this.metadata.transaction(site,s=>{const a=s.assets.find(a=>a.id===id);if(a)a.state='review';});throw Error('MEDIA_UPLOAD_REVIEW');}
 }
 async retire(actor:string,site:string,id:string,expected:number){await this.check(actor,site);await this.metadata.transaction(site,s=>{if(s.revision!==expected)throw Error('MEDIA_CONFLICT');const a=s.assets.find(a=>a.id===id);if(!a)throw Error('MEDIA_NOT_FOUND');if(s.policy?.assets.includes(id))throw Error('MEDIA_REFERENCED');a.state='retired';s.revision++;});}
 /** Deliberately no physical deletion: retention/backup approval is a separate operation. */
 async policy(actor:string,site:string,input:Omit<Policy,'site'|'revision'|'assets'>,ids:string[],expected:number){await this.check(actor,site);if(typeof input.published!=='boolean'||!Number.isFinite(input.validUntil)||input.validUntil<=this.clock()||input.validUntil>this.clock()+86_400_000||[input.demoUntil,input.contractEnds].some(v=>v!==null&&!Number.isFinite(v)))throw Error('MEDIA_POLICY');return this.metadata.transaction(site,s=>{if(s.revision!==expected)throw Error('MEDIA_CONFLICT');if(new Set(ids).size!==ids.length||ids.some(id=>!s.assets.some(a=>a.id===id&&a.state==='ready')))throw Error('MEDIA_NOT_READY');s.revision++;s.policy={...input,site,assets:[...ids],revision:s.revision};return s.policy;});}
}
