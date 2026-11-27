import {mediaDevelopmentEnabled,runDevelopmentMediaSync} from '@/lib/media/development-service';
import 'server-only';
import {randomUUID} from 'node:crypto';
import {type Actor,jstDate} from './engine';
import {list,readSite,execute,acceptPayment} from './repository';
import {MockCardGateway} from './providers';
/** External scheduler entry. No automatic retry for ambiguous provider outcomes. */
export async function runJobs(actor:Actor){const counts={sites:0,payments:0,messages:0,domains:0};for(const row of await list(actor)){
 await execute(actor,row.siteId,'tick',{},randomUUID());let s=(await readSite(actor,row.siteId)).state;counts.sites++;
 for(const inv of s.invoices){if(inv.status!=='paid'&&inv.dueOn<=jstDate(new Date().toISOString())&&((inv.attempt===0&&inv.status==='unpaid')||(inv.paymentRef&&!inv.dispatched))){if(!inv.paymentRef)await execute(actor,row.siteId,'payment-request',{invoiceId:inv.id},randomUUID());await execute(actor,row.siteId,'payment-dispatch',{invoiceId:inv.id},randomUUID());s=(await readSite(actor,row.siteId)).state;const pending=s.invoices.find(i=>i.id===inv.id)!;const result=await new MockCardGateway().charge(pending.paymentRef!,pending.price.gross);await acceptPayment(actor,row.siteId,{invoiceId:inv.id,eventId:'mock_event_'+randomUUID(),paymentRef:pending.paymentRef,gross:pending.price.gross,status:result.status,fee:result.fee},randomUUID());counts.payments++;}}
 for(const message of s.outbox){if(message.state==='pending'&&Date.parse(message.dueAt)<=Date.now()){await execute(actor,row.siteId,'message-dispatch',{id:message.id},randomUUID());counts.messages++;}}
 if(['requested','registering','dns_pending'].includes(s.domain.state)){await execute(actor,row.siteId,'domain-advance',{},randomUUID());counts.domains++;}
 }if(mediaDevelopmentEnabled())await runDevelopmentMediaSync();return counts;}
