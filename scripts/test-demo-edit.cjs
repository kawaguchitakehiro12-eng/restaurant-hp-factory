const puppeteer = require("puppeteer-core");
const fs = require("fs");

const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
];

const executablePath = edgePaths.find((p) => fs.existsSync(p));
if (!executablePath) process.exit(1);

const demoSite = {
  id: "demo-edit-test",
  storeId: "store-edit-test",
  storeName: "編集テスト店",
  storeSlug: "edit-test",
  businessType: "izakaya",
  sourceUrl: "",
  templateId: "luxury-japanese",
  templateType: "luxury-izakaya",
  prospectName: "テスト商事",
  contactPersonName: "テスト太郎",
  phone: "03-0000-0000",
  email: "test@example.com",
  salesStatus: "proposed",
  salesMemo: "",
  siteContractStatus: "demo",
  publishStatus: "published",
  createdAt: "2026-06-14",
  lastUpdatedAt: "2026-06-14",
  content: {
    basicInfo: {
      nameEn: "",
      catchCopy: "オリジナルキャッチ",
      subCopy: "",
      subCopyLines: [],
      concept: "",
      address: "",
      phone: "",
      businessHours: "",
      weekdayHours: "",
      weekendHours: "",
      closedDays: "",
      access: "",
      mapEmbedUrl: "",
      instagramUrl: "",
      reservationUrl: "",
    },
    photos: { hero: "", interior: "", food: "", exterior: "", gallery: [] },
    menus: [],
    topics: [],
  },
};

(async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded" });
  await page.evaluate((site) => {
    localStorage.setItem("sakupage:demo-sites", JSON.stringify([site]));
  }, demoSite);

  await page.goto("http://localhost:3000/edit-test", { waitUntil: "networkidle2", timeout: 20000 });
  const publicText = await page.evaluate(() => document.body.innerText);
  const hasCatch = publicText.includes("オリジナルキャッチ");
  const hasSample = publicText.includes("サンプル");

  await page.goto("http://localhost:3000/admin/demo/edit-test/edit", {
    waitUntil: "domcontentloaded",
  });
  const editUrl = page.url();
  const hasEditPage = editUrl.includes("/admin/demo/edit-test/edit");

  console.log("custom catchCopy:", hasCatch);
  console.log("sample labels:", hasSample);
  console.log("edit page:", hasEditPage);

  if (!hasCatch || !hasSample || !hasEditPage) process.exit(1);
  await browser.close();
  console.log("PASS");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
