/**
 * Supabase 接続確認スクリプト
 * 使い方: node scripts/verify-supabase-connection.mjs
 * (.env.local を読み込むため、Next.js dev サーバー起動前でも node -r dotenv/config 等は不要 —
 *  手動で環境変数が設定されていること、または .env.local を export してから実行)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

const placeholders = ["YOUR_PROJECT_REF", "YOUR_ANON_KEY", "YOUR_SERVICE_ROLE_KEY"];

function isPlaceholder(v) {
  return !v || placeholders.some((p) => v.includes(p));
}

console.log("=== SAKUPAGE Supabase 接続確認 ===\n");

if (isPlaceholder(url)) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL が未設定です (.env.local を編集してください)");
  process.exit(1);
}
if (isPlaceholder(serviceKey)) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}
if (isPlaceholder(anonKey)) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です");
  process.exit(1);
}

console.log("環境変数:");
console.log(`  NEXT_PUBLIC_SUPABASE_URL = ${url}`);
console.log(`  NEXT_PUBLIC_APP_URL      = ${appUrl ?? "(未設定)"}`);
console.log(`  ANON KEY                 = ${anonKey.slice(0, 12)}...`);
console.log(`  SERVICE ROLE KEY         = ${serviceKey.slice(0, 12)}...\n`);

const tables = [
  { name: "customers", column: "id" },
  { name: "demo_sites", column: "id" },
  { name: "store_content", column: "site_id" },
  { name: "photos", column: "id" },
  { name: "demo_shares", column: "id" },
];

async function checkTable(name, column) {
  const res = await fetch(`${url}/rest/v1/${name}?select=${column}&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (res.status === 404 || res.status === 406) {
    return { ok: false, error: `テーブル '${name}' が見つかりません (SQL未実行?)` };
  }
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `${res.status} ${body.slice(0, 120)}` };
  }
  return { ok: true };
}

let allOk = true;
for (const table of tables) {
  const result = await checkTable(table.name, table.column);
  if (result.ok) {
    console.log(`✅ ${table.name}`);
  } else {
    console.log(`❌ ${table.name}: ${result.error}`);
    allOk = false;
  }
}

console.log("");
if (allOk) {
  console.log("✅ Supabase 接続とテーブル確認 OK");
  console.log("\n次: npm run dev を再起動し、/admin/stores を開いてください。");
} else {
  console.log("⚠️  SQL マイグレーションを Supabase SQL Editor で実行してください。");
  process.exit(1);
}
