'use strict';
// Build-only secondary safeguard. Internal Next IPC/loopback and Node workers
// remain available. This is not an OS sandbox or permission to run browser E2E.
const denied=()=>{throw Error('VERIFY_EXTERNAL_NETWORK_DENIED');};
const local=h=>['localhost','127.0.0.1','::1','[::1]'].includes(String(h).toLowerCase());
function urlAllowed(input){let u;try{u=new URL(input instanceof Request?input.url:String(input));}catch{return denied();}if(!local(u.hostname)||u.username||u.password)denied();}
const originalFetch=globalThis.fetch;
globalThis.fetch=(input,init)=>{urlAllowed(input);return originalFetch(input,init);};
for(const name of ['WebSocket','EventSource'])if(name in globalThis)globalThis[name]=denied;
const net=require('node:net'),tls=require('node:tls'),http=require('node:http'),https=require('node:https'),http2=require('node:http2'),dns=require('node:dns'),dp=require('node:dns/promises');
const socketConnect=net.Socket.prototype.connect;
function socketAllowed(args){while(Array.isArray(args[0]))args=args[0];const a=args[0];if(a&&typeof a==='object'){if(a.path){if(!String(a.path).startsWith('/'))denied();return;}if(!local(a.host??'localhost'))denied();}else if(typeof a==='string'&&!/^\d+$/.test(a)){if(!a.startsWith('/'))denied();}else if(!local(typeof args[1]==='string'?args[1]:'localhost'))denied();}
net.Socket.prototype.connect=function(...args){socketAllowed(args);return socketConnect.apply(this,args);};
const tlsConnect=tls.connect;tls.connect=function(...args){socketAllowed(args);return tlsConnect.apply(this,args);};
for(const mod of [http,https])for(const name of ['request','get']){const original=mod[name];mod[name]=function(input,...args){if(typeof input==='string'||input instanceof URL)urlAllowed(input);else if(!local(input?.hostname??input?.host??'localhost'))denied();return original.call(this,input,...args);};}
const http2Connect=http2.connect;http2.connect=function(authority,...args){urlAllowed(authority);return http2Connect.call(this,authority,...args);};
require('node:dgram').createSocket=denied;
for(const mod of [dns,dp])for(const name of Object.keys(mod))if(/^(lookup|resolve|reverse)/.test(name)&&typeof mod[name]==='function'){const original=mod[name];mod[name]=function(host,...args){if(!local(host))denied();return original.call(this,host,...args);};}
require('node:module').syncBuiltinESMExports();
