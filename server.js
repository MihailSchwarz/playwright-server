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

async function fetchHtml(url) {
  try {
    await pagePool.onIdle();
    const page = await waitForAvailablePage();
    page.isAvailable = false;

    try {
      await page.goto(url, { timeout: 15000 });
      const html = await page.content();
      return html;
    } catch (error) {
      console.error("Error processing request:", error);
      return null;
    } finally {
      page.isAvailable = true;
    }
  } catch (error) {
    console.error("Error waiting for available page:", error);
    return null;
  }
}

async function waitForAvailablePage() {
  const interval = 100;
  return new Promise((resolve, reject) => {
    // Добавлен обработчик reject
    const checkForAvailablePage = () => {
      const page = pages.find((page) => page.isAvailable);
      if (page) {
        resolve(page);
      } else {
        setTimeout(checkForAvailablePage, interval);
      }
    };

    try {
      checkForAvailablePage();
    } catch (error) {
      reject(error); // Отклоняем промис в случае ошибки
    }
  });
}

app.get("/r2/", async (req, res) => {
  const url = req.query.urlsdj;

  if (!url) {
    res.send("ok");
    return;
  }

  try {
    const html = await fetchHtml(url);
    // Проверяем, не является ли html null
    if (html) {
      res.send(html);
    } else {
      res.status(500).send("Internal server error");
    }
  } catch (error) {
    console.error("Error while handling request:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/", async (req, res) => {
  res.send("👋");
});

app.listen(PORT, () => {
  console.log(`v.1.0 - Server listening on port ${PORT}`);
});

async function closeServer() {
  console.log("Closing server...");

  try {
    for (const page of pages) {
      try {
        if (page) {
          await page.close();
        }
      } catch (error) {
        console.error("Error closing page:", error);
      }
    }

    try {
      if (context) {
        await context.close();
      }
    } catch (error) {
      console.error("Error closing context:", error);
    }

    try {
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  } finally {
    process.exit();
  }
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
process.on("uncaughtException", (error) => {
  console.error("Unexpected error", error);
  // здесь можно добавить логику восстановления, например, перезапуск браузера или страницы
});
