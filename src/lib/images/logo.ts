import {mediaReference} from '@/lib/media/reference';
/** Managed URLs require server-side ownership checks before persistence. */
export function safeLogo(value:unknown):string{if(value===undefined||value==='')return '';if(typeof value==='string'&&mediaReference(value))return value;if(typeof value!=='string'||value.length>2800000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw new Error('ロゴは2MB以下のPNG・JPEG・WebP画像を選択してください。');const body=value.split(',')[1];if(body.length%4!==0||body.length*3/4>2097154)throw new Error('ロゴ画像の容量を確認してください。');return value;}
