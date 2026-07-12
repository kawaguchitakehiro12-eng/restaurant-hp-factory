/**
 * 共有・公開ページ API 確認
 * 使い方: node scripts/verify-share-pages.cjs [shareToken]
 */
const SHARE_TOKEN =
  process.argv[2] || "hUzb6KzxmAJRozcLkDn1g6OQCsTeu9D2TWeIVXAfpuQ";
const LAN_HOST = process.env.LAN_HOST || "192.168.11.10";
const PORT = process.env.PORT || "3000";

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json();
  return { status: res.status, body };
}

async function checkApi(url, label, validate) {
  const { status, body } = await fetchJson(url);
  if (status !== 200) throw new Error(`HTTP ${status}`);
  validate(body);
  console.log(`OK: ${label}`);
}

async function main() {
  const localhost = `http://localhost:${PORT}`;
  const lan = `http://${LAN_HOST}:${PORT}`;
  let failed = false;

  const checks = [
    [
      `${localhost}/api/public/sites/test1`,
      "test1 API (localhost)",
      (body) => {
        if (!body.resolution?.status) throw new Error("missing resolution.status");
      },
    ],
    [
      `${lan}/api/public/sites/test1`,
      "test1 API (LAN)",
      (body) => {
        if (!body.resolution?.status) throw new Error("missing resolution.status");
      },
    ],
    [
      `${localhost}/api/public/share/${SHARE_TOKEN}`,
      "share API (localhost)",
      (body) => {
        if (body.status !== "found" || !body.resolution?.status) {
          throw new Error("expected status found with resolution");
        }
      },
    ],
    [
      `${lan}/api/public/share/${SHARE_TOKEN}`,
      "share API (LAN)",
      (body) => {
        if (body.status !== "found" || !body.resolution?.status) {
          throw new Error("expected status found with resolution");
        }
      },
    ],
    [`${localhost}/test1`, "test1 page (localhost)", null],
    [`${localhost}/share/${SHARE_TOKEN}`, "share page (localhost)", null],
    [`${lan}/share/${SHARE_TOKEN}`, "share page (LAN)", null],
  ];

  for (const [url, label, validate] of checks) {
    try {
      if (validate) {
        await checkApi(url, label, validate);
      } else {
        const res = await fetch(url, { cache: "no-store" });
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        console.log(`OK: ${label}`);
      }
    } catch (err) {
      failed = true;
      console.error(`FAIL: ${label} — ${err.message}`);
    }
  }

  if (failed) process.exit(1);
  console.log("ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
