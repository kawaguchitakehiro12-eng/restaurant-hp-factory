import 'server-only';
import {createAdminDbClient} from '@/lib/supabase/admin';
import {assertMediaOwnership} from './ownership';
export async function assertCustomerMedia(content:unknown,site:string){
 await assertMediaOwnership(content,site,async id=>{const {data,error}=await createAdminDbClient().from('media_metadata').select('state').eq('site_id',site).maybeSingle();if(error||!data)return false;const state=data.state as {assets?:{id:string;state:string;site:string}[]};return !!state.assets?.some(a=>a.id===id&&a.site===site&&a.state==='ready');});
}
