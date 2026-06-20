const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.85;

/** 画像ファイルを base64 data URL に変換（localStorage 保存用にリサイズ） */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("画像ファイルを選択してください"));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("画像の処理に失敗しました"));
      img.onload = () => {
        if (img.width <= MAX_WIDTH) {
          resolve(dataUrl);
          return;
        }
        const scale = MAX_WIDTH / img.width;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
