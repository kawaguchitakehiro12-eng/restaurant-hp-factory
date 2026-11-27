import {assertMockMode} from '@/lib/commerce/providers';
import {publicationAllowed,type State} from '@/lib/commerce/engine';
import {createAdminDbClient} from '@/lib/supabase/admin';
import {todayJst} from './model';
/** Expiry is checked on reads as well as reconciliation: a delayed scheduler must not keep a site public. */
export async function contractHasEnded(siteId:string):Promise<boolean>{
 if(process.env.SAKUPAGE_COMMERCE_MODE==='mock'&&!process.env.VERCEL){assertMockMode();const v=await createAdminDbClient().from('commerce_sites').select('document').eq('site_id',siteId).maybeSingle();if(v.error)throw new Error('Contract availability unavailable');const state=v.data?.document as State|undefined;if(state?.contracts?.length)return !state.published||!publicationAllowed(state,new Date().toISOString());}
 if(process.env.SALES_OPERATIONS_ENABLED!=='true')return false;
 const {data,error}=await createAdminDbClient().from('sales_contracts').select('ended_on').eq('site_id',siteId).maybeSingle();
 if(error)throw new Error('Contract availability unavailable');
 return Boolean(data?.ended_on&&data.ended_on<todayJst());
}
