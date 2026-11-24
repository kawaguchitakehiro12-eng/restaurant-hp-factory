const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.85;

export async function verifyImageSignature(file: File): Promise<void> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (...prefix: number[]) => prefix.every((value, index) => bytes[index] === value);
  const ascii = (start: number, value: string) => [...value].every((char, index) => bytes[start + index] === char.charCodeAt(0));
  const valid = file.type === "image/png" ? starts(137,80,78,71,13,10,26,10)
    : file.type === "image/jpeg" ? starts(255,216,255)
    : file.type === "image/gif" ? ascii(0,"GIF87a") || ascii(0,"GIF89a")
    : file.type === "image/webp" ? ascii(0,"RIFF") && ascii(8,"WEBP") : false;
  if (!valid) throw new Error("画像の形式が一致しないか、ファイルが壊れています。別の画像を選択してください。");
}

/** 画像ファイルを base64 data URL に変換（localStorage 保存用にリサイズ） */
export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!["image/png","image/jpeg","image/webp","image/gif"].includes(file.type)) {
    return Promise.reject(new Error("PNG・JPEG・WebP・GIF画像を選択してください"));
  }

  if(file.size>8_000_000)return Promise.reject(new Error("画像は8MB以下にしてください。"));
  await verifyImageSignature(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let active = true;
    const timer = setTimeout(() => { fail(new Error("画像の処理が時間切れになりました。小さい画像でやり直してください。")); reader.abort(); }, 15000);
    const finish = (value: string) => { active = false; clearTimeout(timer); resolve(value); };
    const fail = (error: Error) => { active = false; clearTimeout(timer); reject(error); };
    reader.onerror = () => fail(new Error("画像の読み込みに失敗しました"));
    reader.onload = () => {
      if (!active) return;
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => fail(new Error("画像の処理に失敗しました"));
      img.onload = () => {
        if (!active) return;
        if(img.width <= 0 || img.height <= 0 || img.width*img.height>40_000_000){fail(new Error("画像の縦横サイズが大きすぎます。"));return;}
        if (img.width <= MAX_WIDTH && img.height<=MAX_WIDTH && dataUrl.length<=3_000_000) {
          finish(dataUrl);
          return;
        }
        const scale = Math.min(MAX_WIDTH / img.width,MAX_WIDTH / img.height,1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          fail(new Error("画像を処理できません。別の画像を選択してください。"));
          return;
        }
        try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed=canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        if(!compressed.startsWith("data:image/jpeg;base64,")||compressed.length>3_000_000){fail(new Error("画像を小さくしてから選択してください。"));return;}
        finish(compressed);
        } catch { fail(new Error("画像の変換に失敗しました。別の画像を選択してください。")); }
        finally { canvas.width = 0; canvas.height = 0; }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
