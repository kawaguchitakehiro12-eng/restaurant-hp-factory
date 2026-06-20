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

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/admin", {
    waitUntil: "networkidle2",
    timeout: 20000,
  });
  await page.screenshot({
    path: path.join("screenshots", "admin-new-contract.png"),
    fullPage: true,
  });
  await browser.close();
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
