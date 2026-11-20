import {createAdminDbClient} from '@/lib/supabase/admin';
import {todayJst} from './model';
/** Expiry is checked on reads as well as reconciliation: a delayed scheduler must not keep a site public. */
export async function contractHasEnded(siteId:string):Promise<boolean>{
 if(process.env.SALES_OPERATIONS_ENABLED!=='true')return false;
 const {data,error}=await createAdminDbClient().from('sales_contracts').select('ended_on').eq('site_id',siteId).maybeSingle();
 if(error)throw new Error('Contract availability unavailable');
 return Boolean(data?.ended_on&&data.ended_on<todayJst());
}
