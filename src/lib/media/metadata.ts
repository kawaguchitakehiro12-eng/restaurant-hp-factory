import 'server-only';
import type {MetadataStore,MediaState} from './model';
export interface MediaDatabase {read(site:string):Promise<MediaState|null>;compareSwap(site:string,expected:number,state:MediaState):Promise<boolean>}
/** No automatic retry: an unknown RPC acknowledgement requires reconciliation. */
export class DurableMetadata implements MetadataStore {
 constructor(private db:MediaDatabase){}
 async read(site:string){return await this.db.read(site)??{revision:0,assets:[],policy:null};}
 async transaction<T>(site:string,action:(state:MediaState)=>T){const state=structuredClone(await this.read(site)),expected=state.revision,result=action(state);state.revision=Math.max(expected+1,state.revision);if(!await this.db.compareSwap(site,expected,state))throw Error('MEDIA_METADATA_CONFLICT');return result;}
}
