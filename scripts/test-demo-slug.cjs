const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

const executablePath = edgePaths.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge browser found");
  process.exit(1);
}

const demoSite = {
  id: "demo-test-e2e",
  storeId: "store-test-e2e",
  storeName: "テスト食堂",
  storeSlug: "test",
  businessType: "izakaya",
  sourceUrl: "",
  templateId: "luxury-japanese",
  templateType: "luxury-izakaya",
  prospectName: "テスト商事",
  contactPersonName: "テスト太郎",
  phone: "03-0000-0000",
  email: "test@example.com",
  salesStatus: "not_approached",
  salesMemo: "",
  siteContractStatus: "demo",
  publishStatus: "published",
  createdAt: "2026-06-14",
  lastUpdatedAt: "2026-06-14",
  isNewlyCreated: true,
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/admin", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  await page.evaluate((site) => {
    const existing = localStorage.getItem("sakupage:demo-sites");
    const sites = existing ? JSON.parse(existing) : [];
    const filtered = sites.filter((s) => s.storeSlug !== "test");
    localStorage.setItem("sakupage:demo-sites", JSON.stringify([site, ...filtered]));
  }, demoSite);

  await page.goto("http://localhost:3000/test", {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasStoreName = bodyText.includes("テスト食堂");
  const isNotFound = bodyText.includes("サイトが見つかりません");

  console.log("title:", title);
  console.log("hasStoreName:", hasStoreName);
  console.log("isNotFound:", isNotFound);

  if (!hasStoreName || isNotFound) {
    console.error("FAIL: /test did not render demo site");
    process.exit(1);
  }

  await page.goto("http://localhost:3000/admin/stores", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const demoLink = await page.$('a[href*="localhost:3000/test"], a.admin-demo-url-link');
  console.log("admin demo link found:", Boolean(demoLink));

  await browser.close();
  console.log("PASS: demo slug /test renders correctly");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
