import {randomUUID} from 'node:crypto';
/** Log only a fixed operation and a SQLSTATE, never messages, SQL or request bodies. */
export function saveFailure(error:unknown,operation:'operator-site'|'operator-content'|'customer-content'){
 const candidate=error&&typeof error==='object'&&'code'in error?String(error.code):'';
 const code=/^[A-Z0-9]{5}$/.test(candidate)?candidate:'UNKNOWN';
 const requestId=randomUUID();
 console.error('[site-save-failed]',{operation,code,requestId});
 return {error:'保存結果を確認できません。入力内容は保持されています。保存済み内容を確認してから再試行してください。',requestId,code};
}
