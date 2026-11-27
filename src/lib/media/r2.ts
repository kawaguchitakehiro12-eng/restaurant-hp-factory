import type {ObjectStore} from './model';
export interface R2Binding {
 put(key:string,value:Uint8Array,options:{onlyIf:{etagDoesNotMatch:string}|{etagMatches:string};httpMetadata:{contentType:string}}):Promise<unknown|null>;
 get(key:string):Promise<{etag?:string;arrayBuffer():Promise<ArrayBuffer>}|null>;
 delete(key:string):Promise<void>;
}
/** Native Worker binding; no credentials in browser bundles or object URLs. */
export class R2Objects implements ObjectStore {
 constructor(private bucket:R2Binding){}
 async put(key:string,bytes:Uint8Array,type:string){if(!await this.bucket.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:type}}))throw Error('MEDIA_OBJECT_EXISTS');}
 async get(key:string){const o=await this.bucket.get(key);return o?new Uint8Array(await o.arrayBuffer()):null;}
 async remove(key:string){await this.bucket.delete(key);}
}
