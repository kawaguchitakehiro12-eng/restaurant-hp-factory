export const CLIENT_REQUEST_TIMEOUT_MS=20000;
/** No retries: a timeout after a write means its result must be checked. */
export const browserApiFetch: typeof fetch=async(input,init={})=>{
 const signal=init.signal??(input instanceof Request?input.signal:undefined),deadline=AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS);
 try{return await fetch(input,{...init,signal:signal?AbortSignal.any([signal,deadline]):deadline});}
 catch {throw new Error("通信が完了しませんでした。入力内容は残っています。保存結果を確認してから再度お試しください。");}
};

export function apiErrorMessage(body: unknown,status:number):string {
 const error=body && typeof body==="object" && "error" in body ? (body as {error:unknown}).error : null;
 if(typeof error==="string" && /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(error))return error;
 if(status===409)return "別の画面で更新されました。入力を控えて最新の状態を確認してください。";
 if(status===400)return "入力内容を確認してください。入力はこの画面に残っています。";
 if(status===503)return "サービスに接続できません。入力を残したまま、時間をおいてお試しください。";
 return "処理結果を確認できませんでした。現在の状態を確認してから再度お試しください。";
}
export async function readApiJson<T>(response:Response):Promise<T>{
 try{return await response.json() as T;}catch{throw new Error("応答を確認できませんでした。入力は残っています。保存結果を確認してから再度お試しください。");}
}
