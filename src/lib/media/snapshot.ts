import 'server-only';
import {createHash} from 'node:crypto';
import {publicationAllowed,shutdownAt,type State} from '@/lib/commerce/engine';
import type {MediaState,Policy} from './model';
export type MediaRow={site_id:string;state:MediaState;published_assets:string[]};
export type SiteRow={id:string;site_contract_status:string;publish_status:string};
export type ShareRow={id:string;demo_site_id:string;is_active:boolean;created_at:string;expires_at:string|null};
export interface SnapshotSource {
 generation():Promise<number>;page(after:string|null):Promise<MediaRow[]>;
 sites(ids:string[]):Promise<SiteRow[]>;contracts(ids:string[]):Promise<{site_id:string;document:State}[]>;
 shares(ids:string[]):Promise<ShareRow[]>;
}
export async function mediaSnapshot(source:SnapshotSource,now=Date.now()){
 const generation=await source.generation();if(!Number.isSafeInteger(generation)||generation<1)throw Error('MEDIA_GENERATION');
 const policies:Policy[]=[];let after:string|null=null;
 for(let page=0;page<10000;page++){
  const rows=await source.page(after);if(!rows.length){if(await source.generation()!==generation)throw Error('MEDIA_CHANGED');return {complete:true,policies,generation};}
  for(const row of rows){if(after!==null&&row.site_id<=after)throw Error('MEDIA_PAGINATION');after=row.site_id;}
  const ids=rows.map(r=>r.site_id),[sites,contracts,shares]=await Promise.all([source.sites(ids),source.contracts(ids),source.shares(ids)]);
  for(const row of rows){const site=sites.find(s=>s.id===row.site_id),state=contracts.find(c=>c.site_id===row.site_id)?.document;
   const ready=row.state.assets.filter(a=>a.state==='ready').map(a=>a.id),assets=row.published_assets.filter(id=>ready.includes(id));
   if(assets.length!==row.published_assets.length)throw Error('MEDIA_REFERENCES');
   let published=site?.site_contract_status==='contracted'&&site?.publish_status==='published',contractEnds:number|null=null;
   if(state?.contracts?.length){const contract=state.contracts.at(-1)!;contractEnds=contract.finished?0:contract.endOn?Date.parse(shutdownAt(contract.endOn)):null;published=!!published&&state.published&&publicationAllowed(state,new Date(now).toISOString());}
   const active=shares.filter(s=>s.demo_site_id===row.site_id&&s.is_active).map(s=>({id:s.id,end:Math.min(Date.parse(s.created_at)+7*86400000,s.expires_at?Date.parse(s.expires_at):Infinity)})).filter(s=>Number.isFinite(s.end)&&s.end>now).sort((a,b)=>a.id.localeCompare(b.id));
   const canShare=site&&['demo','contracted'].includes(site.site_contract_status)&&['draft','published'].includes(site.publish_status)&&(contractEnds===null||contractEnds>now);
   policies.push({site:row.site_id,revision:generation,published:!!published,demoUntil:canShare&&active.length?Math.max(...active.map(s=>s.end)):null,contractEnds,assets:site?assets:[],previewAssets:site?ready:[],shareEpoch:createHash('sha256').update(JSON.stringify(active)).digest('hex'),validUntil:now+86400000});
  }
 }
 throw Error('MEDIA_PAGINATION_LIMIT');
}
