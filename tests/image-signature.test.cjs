const {test}=require('node:test'),assert=require('node:assert/strict');
const {verifyImageSignature}=require('./load-ts.cjs').load('src/lib/images/read-image-file.ts');
for(const [type,bytes]of [['image/png',[137,80,78,71,13,10,26,10]],['image/jpeg',[255,216,255]],['image/gif',Buffer.from('GIF89a')],['image/webp',Buffer.from('RIFF0000WEBP')]])test('accept signature '+type,()=>verifyImageSignature(new File([new Uint8Array(bytes)],'fixture',{type})));
for(const [name,type,bytes]of [['mismatched','image/jpeg',[137,80,78,71,13,10,26,10]],['truncated','image/png',[137,80]],['empty','image/gif',[]],['script','image/webp',Buffer.from('<script>')]])test('reject '+name,()=>assert.rejects(verifyImageSignature(new File([new Uint8Array(bytes)],'fixture',{type})),/形式/));

const {readImageFileAsDataUrl}=require('./load-ts.cjs').load('src/lib/images/read-image-file.ts');
function browser(t,{decodeError=false,readError=false,width=1,height=1,convertError=false,emptyCanvas=false}={}) {
 const old={FileReader:global.FileReader,Image:global.Image,document:global.document};
 const canvas={width:0,height:0,getContext:()=>({drawImage(){if(convertError)throw Error('synthetic conversion failure')}}),toDataURL:()=> emptyCanvas?'data:,':'data:image/jpeg;base64,fixture'};
 global.FileReader=class {readAsDataURL(){this.result='data:image/png;base64,fixture';queueMicrotask(()=>readError?this.onerror():this.onload())}abort(){}};
 global.Image=class {width=width;height=height;set src(value){queueMicrotask(()=>decodeError?this.onerror():this.onload())}};
 global.document={createElement:()=>canvas};t.after(()=>Object.assign(global,old));return canvas;
}
const png=()=>new File([new Uint8Array([137,80,78,71,13,10,26,10])],'fixture.png',{type:'image/png'});
test('decoded small image is preserved',async t=>{browser(t);assert.equal(await readImageFileAsDataUrl(png()),'data:image/png;base64,fixture')});
test('corrupt image decode is rejected',async t=>{browser(t,{decodeError:true});await assert.rejects(readImageFileAsDataUrl(png()),/処理に失敗/)});
test('file reader failure is rejected',async t=>{browser(t,{readError:true});await assert.rejects(readImageFileAsDataUrl(png()),/読み込み/)});
test('extreme decoded dimensions are rejected',async t=>{browser(t,{width:10000,height:10000});await assert.rejects(readImageFileAsDataUrl(png()),/縦横/)});
test('conversion failure is reported and canvas released',async t=>{const canvas=browser(t,{width:2000,height:1000,convertError:true});await assert.rejects(readImageFileAsDataUrl(png()),/変換/);assert.equal(canvas.width,0)});
test('resized image succeeds and canvas memory is released',async t=>{const canvas=browser(t,{width:2000,height:1000});assert.equal(await readImageFileAsDataUrl(png()),'data:image/jpeg;base64,fixture');assert.equal(canvas.width,0);assert.equal(canvas.height,0)});

test('image timeout rejects processing and ignores late decode',async t=>{browser(t);const oldTimer=global.setTimeout,oldClear=global.clearTimeout;global.setTimeout=callback=>{queueMicrotask(callback);return 1};global.clearTimeout=()=>{};t.after(()=>{global.setTimeout=oldTimer;global.clearTimeout=oldClear});await assert.rejects(readImageFileAsDataUrl(png()),/時間切れ/)});

test('extreme aspect ratio never requests a zero-sized canvas',async t=>{const canvas=browser(t,{width:1,height:100000});let captured;const draw=canvas.getContext;canvas.getContext=()=>{captured={width:canvas.width,height:canvas.height};return draw()};await readImageFileAsDataUrl(png());assert.deepEqual(captured,{width:1,height:1280});});
test('empty canvas encoding is rejected instead of saved as an image',async t=>{browser(t,{width:2000,height:1000,emptyCanvas:true});await assert.rejects(readImageFileAsDataUrl(png()),/小さく/);});
