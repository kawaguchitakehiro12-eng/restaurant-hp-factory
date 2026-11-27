/** Below the hosting request limit, measured as UTF-8 bytes including JSON. */
export const MAX_SAVE_BODY_BYTES=4_000_000;
export function serializeSaveBody(value:unknown):string {
 const body=JSON.stringify(value);
 if(new TextEncoder().encode(body).byteLength>MAX_SAVE_BODY_BYTES)throw new Error('写真と本文の合計が大きすぎます。画像を小さくするか枚数を減らしてください。入力内容は保存せず画面に残しています。');
 return body;
}
