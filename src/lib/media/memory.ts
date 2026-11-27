import type {MetadataStore,MediaState,ObjectStore} from './model';
/** Synthetic fixtures only. Never use process memory as production metadata. */
export class MemoryMetadata implements MetadataStore {
 private data=new Map<string,MediaState>();private tail:Promise<unknown>=Promise.resolve();
 transaction<T>(site:string,action:(state:MediaState)=>T):Promise<T>{const run=this.tail.then(()=>{const state=structuredClone(this.data.get(site)??{revision:0,assets:[],policy:null});const result=action(state);this.data.set(site,state);return structuredClone(result)});this.tail=run.catch(()=>{});return run;}
 async read(site:string){return structuredClone(this.data.get(site)??{revision:0,assets:[],policy:null});}
}
export class MemoryObjects implements ObjectStore {
 readonly data=new Map<string,Uint8Array>();fail:'put'|'get'|'remove'|null=null;
 async put(key:string,bytes:Uint8Array){if(this.fail==='put')throw Error('MOCK_STORAGE');if(this.data.has(key))throw Error('MEDIA_OBJECT_EXISTS');this.data.set(key,new Uint8Array(bytes));}
 async get(key:string){if(this.fail==='get')throw Error('MOCK_STORAGE');const b=this.data.get(key);return b?new Uint8Array(b):null;}
 async remove(key:string){if(this.fail==='remove')throw Error('MOCK_STORAGE');this.data.delete(key);}
}
