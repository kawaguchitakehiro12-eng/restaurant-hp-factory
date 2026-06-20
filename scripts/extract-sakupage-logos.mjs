import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

import fs from "fs";

const source = path.join(root, "assets", "sakupage-brand-source.png");

async function resolveSource() {
  if (fs.existsSync(source)) return source;
  throw new Error(
    "Source logo not found. Place the official asset at assets/sakupage-brand-source.png"
  );
}

async function trimPng(inputBuffer) {
  return sharp(inputBuffer).trim().png().toBuffer();
}

async function main() {
  const srcPath = await resolveSource();
  const meta = await sharp(srcPath).metadata();
  const { width, height } = meta;
  console.log("Source:", srcPath, width, height);

  const splitY = Math.round(height * 0.52);

  const horizontalRaw = await sharp(srcPath)
    .extract({ left: 0, top: 0, width, height: splitY })
    .png()
    .toBuffer();

  const iconRaw = await sharp(srcPath)
    .extract({ left: 0, top: splitY, width, height: height - splitY })
    .png()
    .toBuffer();

  const brandDir = path.join(root, "public", "brand");
  fs.mkdirSync(brandDir, { recursive: true });

  const horizontal = await trimPng(horizontalRaw);
  const icon = await trimPng(iconRaw);

  await sharp(horizontal).png().toFile(path.join(brandDir, "sakupage-logo.png"));
  await sharp(icon).png().toFile(path.join(brandDir, "sakupage-icon.png"));

  await sharp(icon).resize(32, 32).png().toFile(path.join(brandDir, "favicon-32.png"));
  await sharp(icon).resize(64, 64).png().toFile(path.join(brandDir, "favicon-64.png"));
  await sharp(icon).resize(180, 180).png().toFile(path.join(brandDir, "apple-touch-icon-180.png"));

  const hMeta = await sharp(horizontal).metadata();
  const iMeta = await sharp(icon).metadata();
  console.log("Horizontal:", hMeta.width, hMeta.height);
  console.log("Icon:", iMeta.width, iMeta.height);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
