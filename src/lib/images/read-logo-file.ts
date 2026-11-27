import {verifyImageSignature} from './read-image-file';import {safeLogo} from './logo';
export async function readLogoFile(file:File):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2097152)throw new Error('2MB以下のPNG・JPEG・WebP画像を選択してください。');await verifyImageSignature(file);
 const image=await new Promise<ImageBitmap>((resolve,reject)=>{let active=true;const timer=setTimeout(()=>{active=false;reject(new Error('画像処理が時間切れになりました。'))},15000);createImageBitmap(file).then(v=>{clearTimeout(timer);if(active)resolve(v);else v.close()},()=>{clearTimeout(timer);if(active)reject(new Error('画像を読み込めません。'))})});
 const canvas=document.createElement('canvas');
 try{if(!image.width||!image.height||image.width*image.height>16000000)throw new Error('画像のサイズが大きすぎます。');const ratio=Math.min(512/image.width,512/image.height,1);canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('画像を処理できません。');ctx.drawImage(image,0,0,canvas.width,canvas.height);return safeLogo(canvas.toDataURL('image/png'));}finally{image.close();canvas.width=0;canvas.height=0;}
}
