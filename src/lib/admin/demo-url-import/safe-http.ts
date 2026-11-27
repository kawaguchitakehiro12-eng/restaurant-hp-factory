import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const denied4 = new BlockList();
for (const [ip, prefix] of [["0.0.0.0",8],["10.0.0.0",8],["100.64.0.0",10],["127.0.0.0",8],["169.254.0.0",16],["172.16.0.0",12],["192.0.0.0",24],["192.0.2.0",24],["192.88.99.0",24],["192.168.0.0",16],["198.18.0.0",15],["198.51.100.0",24],["203.0.113.0",24],["224.0.0.0",3]] as const) denied4.addSubnet(ip,prefix,"ipv4");
const global6 = new BlockList(); global6.addSubnet("2000::",3,"ipv6");
const denied6 = new BlockList();
for (const [ip,prefix] of [["2001::",23],["2001:db8::",32],["2002::",16],["3fff::",20]] as const) denied6.addSubnet(ip,prefix,"ipv6");
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  return family === 4 ? !denied4.check(address,"ipv4") : family === 6 && global6.check(address,"ipv6") && !denied6.check(address,"ipv6");
}
export function parsePublicUrl(raw: string): URL {
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  const host = url.hostname.replace(/^\[|\]$/g,"").toLowerCase().replace(/\.$/,"");
  if (!["http:","https:"].includes(url.protocol) || url.username || url.password || url.port || !host || (isIP(host) ? !isPublicAddress(host) : !host.includes(".") || /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host))) throw Error("Blocked URL");
  url.hash = "";
  return url;
}
export async function resolvePublicTarget(url: URL, resolve: typeof lookup = lookup) {
  const host = url.hostname.replace(/^\[|\]$/g,"");
  const addresses = isIP(host) ? [{address:host,family:isIP(host)}] : await resolve(host,{all:true,verbatim:true});
  if (!addresses.length || addresses.some(x=>!isPublicAddress(x.address))) throw Error("Blocked DNS result");
  return addresses[0];
}
type Result = { status: number; headers: Headers; body: Buffer; url: string };
type Options = { method?: "GET" | "HEAD"; limit: number; headers?: Record<string,string>; timeout?: number; prefixOnly?: boolean };
async function requestOnce(url: URL, target: {address:string;family:number}, options: Options, signal: AbortSignal): Promise<Result> {
  return new Promise((resolve,reject)=>{
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = send(url,{method:options.method??"GET",signal,agent:false,family:target.family,
      lookup:(_host,_opts,callback)=>callback(null,target.address,target.family),
      headers:{...options.headers,"Accept-Encoding":"identity"}},res=>{
      const headers = new Headers();
      for (const [name,value] of Object.entries(res.headers)) if(value!==undefined) headers.set(name,Array.isArray(value)?value.join(","):value);
      const result = {status:res.statusCode??0,headers,body:Buffer.alloc(0),url:url.href};
      if ((result.status>=300&&result.status<400)||options.method==="HEAD") { resolve(result);res.destroy();return; }
      if (headers.get("content-encoding") && headers.get("content-encoding")!=="identity") {res.destroy();reject(Error("Unsupported encoding"));return;}
      if (!options.prefixOnly && Number(headers.get("content-length"))>options.limit) {res.destroy();reject(Error("Response too large"));return;}
      const chunks:Buffer[]=[];let size=0;
      res.on("data",(chunk:Buffer)=>{
        const remaining=options.limit-size;
        if(chunk.length>remaining){
          if(options.prefixOnly){chunks.push(chunk.subarray(0,remaining));resolve({...result,body:Buffer.concat(chunks)});res.destroy();}
          else {reject(Error("Response too large"));res.destroy();}
          return;
        }
        chunks.push(chunk);size+=chunk.length;
      });
      res.on("end",()=>resolve({...result,body:Buffer.concat(chunks)}));
      res.on("error",reject);res.on("aborted",()=>reject(Error("Aborted response")));
    });
    req.on("error",reject);req.end();
  });
}
/** Revalidates every hop, pins the checked IP, and bounds bytes and total duration. */
export async function safeReadUrl(raw: string, options: Options, deps={resolve:resolvePublicTarget,request:requestOnce}): Promise<Result> {
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),options.timeout??15000);
  const signal=controller.signal;
  const abort=new Promise<never>((_,reject)=>signal.addEventListener("abort",()=>reject(Error("Fetch timeout")),{once:true}));
  try {
    let url=parsePublicUrl(raw);
    for(let hop=0;hop<=5;hop++) {
      const target=await Promise.race([deps.resolve(url),abort]);signal.throwIfAborted();
      const response=await Promise.race([deps.request(url,target,options,signal),abort]);
      if([301,302,303,307,308].includes(response.status)){
        const location=response.headers.get("location");if(!location||hop===5)throw Error("Invalid redirects");
        const next=parsePublicUrl(new URL(location,url).href);
        if(url.protocol==="https:"&&next.protocol!=="https:")throw Error("Insecure redirect");
        url=next;continue;
      }
      return response;
    }
    throw Error("Too many redirects");
  } finally { clearTimeout(timer); }
}
