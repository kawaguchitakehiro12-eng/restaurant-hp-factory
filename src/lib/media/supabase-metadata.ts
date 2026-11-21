import 'server-only';
import {createAdminDbClient} from '@/lib/supabase/admin';
import type {MediaDatabase} from './metadata';
import type {MediaState} from './model';
/** Not activated by existing save routes. SQL proposal needs separate approval. */
export class SupabaseMediaDatabase implements MediaDatabase {
 async read(site:string){const {data,error}=await createAdminDbClient().from('media_metadata').select('state').eq('site_id',site).maybeSingle();if(error)throw Error('MEDIA_METADATA_UNAVAILABLE');return data?data.state as MediaState:null;}
 async compareSwap(site:string,expected:number,state:MediaState){const {data,error}=await createAdminDbClient().rpc('media_compare_swap_v1',{p_site:site,p_expected:expected,p_state:state});if(error)throw Error('MEDIA_METADATA_UNKNOWN');return data===true;}
}
