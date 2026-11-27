// HTTP simulation only: not a Postgres/RLS implementation. Never loads .env files.
const http=require('node:http'),crypto=require('node:crypto');
const ANON='sb_publishable_SYNTHETIC_LOCAL_ONLY',SERVICE='sb_secret_SYNTHETIC_LOCAL_ONLY';
const clone=value=>JSON.parse(JSON.stringify(value));
function createFixtureBackend(){
 const state={tables:{demo_sites:[],customers:[],store_content:[],photos:[],demo_shares:[],contract_operations:[],demo_deliveries:[],demo_delivery_usage:[],manual_invoices:[],commercial_terms:[]},users:[],failure:null,calls:[],providerCalls:0};
 const secret=crypto.randomBytes(32);let revision=0;
 const stamp=()=>new Date(Date.now()+(++revision)).toISOString();
 function user(email,role='customer',password='Fixture-only-password-123!'){const u={id:crypto.randomUUID(),aud:'authenticated',role:'authenticated',email,email_confirmed_at:stamp(),created_at:stamp(),updated_at:stamp(),app_metadata:{role},user_metadata:{},identities:[]};state.users.push({user:u,password});return u;}
 const operator=user('operator@example.invalid','operator');
 function token(u){const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url'),body=enc({alg:'HS256',typ:'JWT'})+'.'+enc({sub:u.id,iss:'fixture-only',aud:'authenticated',role:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,email:u.email,app_metadata:u.app_metadata});return body+'.'+crypto.createHmac('sha256',secret).update(body).digest('base64url');}
 function tokenUser(req){try{const value=(req.headers.authorization??'').replace(/^Bearer /,'');const id=JSON.parse(Buffer.from(value.split('.')[1],'base64url')).sub;return state.users.find(x=>x.user.id===id)?.user}catch{return null}}
 const failure=(code,message,status=400)=>({fixtureError:true,code,message,status});
 function siteRow(row){const value=clone(row);value.store_content=state.tables.store_content.filter(x=>x.site_id===row.id);const customer=state.tables.customers.find(x=>x.id===row.customer_id);value.customer=customer?{auth_user_id:customer.auth_user_id}:null;return value;}
 function matches(row,key,value){let actual=key==='customer.auth_user_id'?state.tables.customers.find(x=>x.id===row.customer_id)?.auth_user_id:row[key];if(value.startsWith('eq.'))return String(actual)===value.slice(3);if(value.startsWith('neq.'))return String(actual)!==value.slice(4);if(value.startsWith('is.'))return value==='is.null'?actual==null:String(actual)===value.slice(3);if(value.startsWith('in.('))return value.slice(4,-1).split(',').includes(String(actual));if(value.startsWith('ilike.'))return String(actual).toLowerCase()===value.slice(6).toLowerCase();return true;}
 function selection(table,url){let rows=state.tables[table].filter(row=>[...url.searchParams].every(([k,v])=>['select','order','limit','on_conflict','offset'].includes(k)||matches(row,k,v)));const order=url.searchParams.get('order');if(order){const [key,direction]=order.split('.');rows.sort((a,b)=>String(a[key]??'').localeCompare(String(b[key]??''))*(direction==='desc'?-1:1))}const limit=Number(url.searchParams.get('limit'));if(limit>0)rows=rows.slice(0,limit);return rows;}
 function saveContent(id,content){const old=state.tables.store_content.find(x=>x.site_id===id);const row={site_id:id,content:clone(content),updated_at:stamp()};if(old)Object.assign(old,row);else state.tables.store_content.push(row);return row;}
 function rpc(name,a){
  if(name==='save_operator_demo_v1'){
   const exists=state.tables.demo_sites.find(x=>x.id===a.p_site.id);if(a.p_create&&exists)throw failure('23505','Duplicate site',409);if(!a.p_create&&!exists)throw failure('PT409','Not found',409);
   const stored=state.tables.store_content.find(x=>x.site_id===a.p_site.id);if(!a.p_create&&Object.hasOwn(a,'p_expected_updated_at')&&(stored?.updated_at??null)!==a.p_expected_updated_at)throw failure('PT409','Concurrent save',409);
   if(state.failure==='save')throw failure('22023','Simulated failed save',400);
   if(exists)Object.assign(exists,clone(a.p_site));else state.tables.demo_sites.push(clone(a.p_site));if(a.p_content)saveContent(a.p_site.id,a.p_content);return null;
  }
  if(name==='set_site_visibility_v1'){
   const site=state.tables.demo_sites.find(x=>x.id===a.p_id),stored=state.tables.store_content.find(x=>x.site_id===a.p_id);
   if(!site||site.publish_status!==a.p_expected_publish_status||site.site_contract_status!==a.p_expected_contract_status||(a.p_action==='resume'&&(stored?.updated_at??null)!==a.p_expected_updated_at))throw failure('PT409','Visibility conflict',409);
   site.publish_status=a.p_action==='suspend'?'suspended':site.site_contract_status==='demo'?'draft':'published';saveContent(site.id,stored?.content??{});return null;
  }
  if(name==='save_customer_site_content'){

   const site=state.tables.demo_sites.find(x=>x.store_slug===a.p_slug&&x.site_contract_status==='contracted'&&x.publish_status!=='suspended'&&state.tables.customers.some(c=>c.id===x.customer_id&&c.auth_user_id===a.p_user_id));if(!site)throw failure('42501','Not found',403);
   const stored=state.tables.store_content.find(x=>x.site_id===site.id);if((stored?.updated_at??null)!==a.p_expected_updated_at)throw failure('PT409','Concurrent save',409);if(state.failure==='save')throw failure('22023','Simulated failed save',400);return saveContent(site.id,a.p_content).updated_at;
  }
  if(['complete_site_contract','complete_site_contract_v2'].includes(name)){
   const op=state.tables.contract_operations.find(x=>x.id===a.p_operation_id),site=state.tables.demo_sites.find(x=>x.id===op?.site_id);if(!op||!site||op.operator_id!==a.p_operator_id)throw failure('42501','Not allowed',403);if(op.state==='complete')return null;if(site.site_contract_status!=='demo')throw failure('PT409','State changed',409);
   if(name==='complete_site_contract_v2'&&(state.tables.store_content.find(x=>x.site_id===site.id)?.updated_at??null)!==a.p_expected_updated_at)throw failure('PT409','Contract revision conflict',409);const c=a.p_customer,k=a.p_contract;state.tables.customers.push({id:c.id,name:c.name,contact_email:c.contactEmail,contact_phone:c.contactPhone,contact_person_name:c.contactPersonName,auth_user_id:op.auth_user_id,created_at:stamp().slice(0,10)});Object.assign(site,{store_slug:k.storeSlug,customer_id:c.id,site_contract_status:'contracted',sales_status:'contracted',publish_status:'published',contract_start_date:k.contractStartDate,minimum_term_end_date:k.minimumTermEndDate,monthly_fee:k.monthlyFee,domain_status:k.domainStatus,login_email:c.contactEmail,initial_password:null,next_billing_date:k.nextBillingDate,billing_status:'pending',plan_name:'スタンダード',payment_method:'invoice',published_at:stamp().slice(0,10),last_updated_at:stamp().slice(0,10)});op.state='complete';return null;
  }
  if(['reserve_demo_delivery','reserve_demo_delivery_v2'].includes(name)){
   const existing=state.tables.demo_deliveries.find(x=>x.id===a.p_id);if(existing){if(existing.request_hash!==a.p_hash||existing.actor_id!==a.p_actor)throw failure('PT409','Conflict',409);return{claimed:false,delivery:existing}}
   const share=state.tables.demo_shares.find(x=>x.id===a.p_share),site=state.tables.demo_sites.find(x=>x.id===share?.demo_site_id);if(!share?.is_active||!site||!['demo','contracted'].includes(site.site_contract_status)||site.publish_status==='suspended'||(share.expires_at&&Date.parse(share.expires_at)<=Date.now()))throw failure('PT409','Unavailable',409);
   if(state.tables.demo_deliveries.some(x=>x.request_hash===a.p_hash&&Date.now()-Date.parse(x.created_at)<60000))throw failure('PT429','Rate limit',429);
   const delivery={id:a.p_id,actor_id:a.p_actor,share_id:a.p_share,channel:a.p_channel,recipient:a.p_recipient,mode:a.p_mode,request_hash:a.p_hash,status:'processing',created_at:stamp()};state.tables.demo_deliveries.push(delivery);return {claimed:true,delivery};
  }
  throw failure('PGRST202','Unknown fixture RPC',404);
 }
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');res.setHeader('Access-Control-Allow-Origin',req.headers.origin??'*');res.setHeader('Access-Control-Allow-Headers','authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer,range,x-supabase-client-platform,x-supabase-client-platform-version,x-supabase-client-runtime,x-supabase-client-runtime-version');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,HEAD,OPTIONS');
  const send=(status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(req.method==='HEAD'?'':JSON.stringify(body))};if(req.method==='OPTIONS'){res.statusCode=204;res.end();return}
  try{let text='';for await(const chunk of req){text+=chunk;if(text.length>9_000_000)throw failure('SIZE','Too large',413)}const body=text?JSON.parse(text):{};state.calls.push({method:req.method,path:url.pathname});
   if(url.pathname.startsWith('/auth/v1/')){
    const route=url.pathname.slice(9);
    if(route==='token') {let u;if(url.searchParams.get('grant_type')==='refresh_token')u=state.users.find(x=>x.user.id===body.refresh_token);else u=state.users.find(x=>x.user.email===body.email&&x.password===body.password);if(!u){send(400,{error:'invalid_grant',error_description:'Invalid test credentials'});return}send(200,{access_token:token(u.user),refresh_token:u.user.id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:u.user});return}
    if(route==='user'){const u=tokenUser(req);if(!u){send(401,{message:'Invalid session'});return}if(req.method==='PUT'){const entry=state.users.find(x=>x.user.id===u.id);if(body.password)entry.password=body.password}send(200,u);return}
    if(route==='admin/users'&&req.method==='POST'){if(state.users.some(x=>x.user.email===body.email)){send(422,{msg:'Email already registered',code:'email_exists'});return}const u=user(body.email,body.app_metadata?.role??'customer',body.password);u.app_metadata={...body.app_metadata};send(200,u);return}
    if(route.startsWith('admin/users/')){const id=route.split('/').pop(),entry=state.users.find(x=>x.user.id===id);if(req.method==='DELETE')state.users=state.users.filter(x=>x.user.id!==id);send(200,entry?.user??{});return}
    if(['logout','recover'].includes(route)){send(200,{});return}send(404,{message:'Unsupported fixture auth endpoint'});return;
   }
   if(url.pathname.startsWith('/rest/v1/')){
    if(req.headers.apikey!==SERVICE){send(403,{code:'42501',message:'Direct table access denied'});return}
    if(state.failure==='offline')throw failure('FIXTURE_OFFLINE','Unavailable',503);
    const target=url.pathname.slice(9);if(target.startsWith('rpc/')){send(200,rpc(target.slice(4),body));return}
    const table=target;if(!state.tables[table]){send(404,{code:'42P01',message:'Unknown fixture table'});return}
    let rows=selection(table,url);
    if(req.method==='POST'){
     const values=Array.isArray(body)?body:[body];rows=[];
     for(const value of values){const key=['store_content','commercial_terms'].includes(table)?'site_id':'id';const old=state.tables[table].find(x=>x[key]===value[key]);if(old&&String(req.headers.prefer).includes('merge-duplicates')){Object.assign(old,clone(value));rows.push(old)}else{if(old)throw failure('23505','Duplicate fixture row',409);const row=clone(value);if(['manual_invoices','commercial_terms'].includes(table)){row.updated_at=stamp();if(state.failure==='commercial-save')throw failure('FIXTURE_OFFLINE','Synthetic write failure',503);if(table==='manual_invoices'){row.created_at=stamp();const terms=state.tables.commercial_terms.find(x=>x.site_id===row.site_id);if(terms?.cancellation_on&&row.period>terms.cancellation_on.slice(0,7))throw failure('23514','Outside contract',409);if(state.tables.manual_invoices.some(x=>x.site_id===row.site_id&&x.status!=='void'&&x.kind===row.kind&&(row.kind==='initial'||x.period===row.period)))throw failure('23505','Duplicate period',409);}}if(table==='demo_sites'){row.initial_password??=null;row.customer_id??=null}state.tables[table].push(row);rows.push(row)}}
    }else if(req.method==='PATCH'){if(['manual_invoices','commercial_terms'].includes(table)&&state.failure==='commercial-save')throw failure('FIXTURE_OFFLINE','Synthetic write failure',503);rows.forEach(x=>Object.assign(x,clone(body)))}else if(req.method==='DELETE'){if(table==='demo_sites'&&rows.some(x=>state.tables.manual_invoices.some(i=>i.site_id===x.id)||state.tables.commercial_terms.some(t=>t.site_id===x.id)))throw failure('23503','Ledger protected',409);state.tables[table]=state.tables[table].filter(x=>!rows.includes(x));if(table==='demo_sites'){const ids=rows.map(x=>x.id);const shares=state.tables.demo_shares.filter(x=>ids.includes(x.demo_site_id)).map(x=>x.id);state.tables.demo_shares=state.tables.demo_shares.filter(x=>!shares.includes(x.id));state.tables.demo_deliveries=state.tables.demo_deliveries.filter(x=>!shares.includes(x.share_id));state.tables.store_content=state.tables.store_content.filter(x=>!ids.includes(x.site_id));}}
    res.setHeader('Content-Range',`0-${Math.max(rows.length-1,0)}/${rows.length}`);const mapped=table==='demo_sites'?rows.map(siteRow):clone(rows);if(req.method==='HEAD'){send(200,[]);return}if(String(req.headers.accept).includes('vnd.pgrst.object+json')){if(mapped.length!==1){send(406,{code:'PGRST116',message:'Object not found'});return}send(200,mapped[0]);return}send(req.method==='POST'?201:200,mapped);return;
   }
   send(404,{message:'Fixture-only endpoint'});
  }catch(error){send(error.status??500,{code:error.code??'FIXTURE_ERROR',message:error.fixtureError?error.message:'Fixture failure'})}
 });
 return {server,state,operator,user,stamp,saveContent,keys:{anon:ANON,service:SERVICE}};
}
module.exports={createFixtureBackend};
