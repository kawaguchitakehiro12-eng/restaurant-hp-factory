import {randomUUID} from 'node:crypto';
import {assertMockMode,verifyMockWebhook} from '@/lib/commerce/providers';
import {acceptPayment} from '@/lib/commerce/repository';
import {CommerceError} from '@/lib/commerce/engine';
export async function POST(request:Request){try{assertMockMode();const secret=process.env.COMMERCE_WEBHOOK_SECRET??'',actor=process.env.COMMERCE_WORKER_ACTOR_ID;if(!secret||!actor)return Response.json({error:'Webhookは未設定です。'},{status:503});
 const reader=request.body?.getReader();if(!reader)return Response.json({error:'Bad request'},{status:400});let size=0;const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>16000){await reader.cancel();return Response.json({error:'Payload too large'},{status:413})}chunks.push(part.value)}const raw=Buffer.concat(chunks).toString('utf8');
 if(!verifyMockWebhook(raw,request.headers.get('x-commerce-signature'),secret))return Response.json({error:'Invalid signature'},{status:401});const event=JSON.parse(raw);if(typeof event.siteId!=='string'||!String(event.eventId).startsWith('mock_event_'))return Response.json({error:'Invalid event'},{status:400});
 await acceptPayment({id:actor,role:'operator',email:''},event.siteId,event,randomUUID());return Response.json({received:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:'結果照合を停止しました。'},{status:e instanceof CommerceError?e.status:503})}}
