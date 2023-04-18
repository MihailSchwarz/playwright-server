import express from "express";
import { firefox } from "playwright";
import PQueue from "p-queue";

const app = express();
const PORT = 30823;

const PAGE_POOL_SIZE = 5;
const pagePool = new PQueue({ concurrency: PAGE_POOL_SIZE });
const pages = [];

let browser;
let context;

(async () => {
  try {
    browser = await firefox.launch({ headless: true });
    context = await browser.newContext();

    for (let i = 0; i < PAGE_POOL_SIZE; i++) {
      const page = await context.newPage();
      page.isAvailable = true;
      pages.push(page);
    }
  } catch (error) {
    console.error("Error initializing browser:", error);
    process.exit(1);
  }
})();

async function waitForAvailablePage() {
  const interval = 100;
  return new Promise((resolve) => {
    const checkForAvailablePage = () => {
      const page = pages.find((page) => page.isAvailable);
      if (page) {
        resolve(page);
      } else {
        setTimeout(checkForAvailablePage, interval);
      }
    };
    checkForAvailablePage();
  });
}

async function fetchHtml(url) {
  await pagePool.onIdle();
  const page = await waitForAvailablePage();
  page.isAvailable = false;

  try {
    await page.goto(url, { timeout: 15000 });
    const html = await page.content();
    return html;
  } catch (error) {
    console.error("Error processing request:", error);
    throw error;
  } finally {
    page.isAvailable = true;
  }
}

app.get("/r2/", async (req, res) => {
  const url = req.query.urlsdj;

  if (!url) {
    res.send("ok");
    return;
  }

  try {
    const html = await fetchHtml(url);
    res.send(html);
  } catch (error) {
    console.error("Error while handling request:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/", async (req, res) => {
  res.send("👋");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
