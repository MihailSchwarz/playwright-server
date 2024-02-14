import express from "express";
import { firefox } from "playwright";
import PQueue from "p-queue";

const app = express();
const PORT = 30823;

const PAGE_POOL_SIZE = 5;
const pagePool = new PQueue({ concurrency: PAGE_POOL_SIZE });
const pages = [];

let browser;

// Список прокси-серверов
const proxies = [
  "104.239.82.6:5687:zrguskhf:pitpbu81akov",
  "104.238.9.232:6685:zrguskhf:pitpbu81akov",
  "194.39.34.87:6099:zrguskhf:pitpbu81akov",
  "154.85.101.202:5633:zrguskhf:pitpbu81akov",
];

(async () => {
  try {
    browser = await firefox.launch({ headless: true });

    for (let i = 0; i < PAGE_POOL_SIZE; i++) {
      // Выбор случайного прокси из списка
      const proxyString = proxies[Math.floor(Math.random() * proxies.length)];
      const [server, port, username, password] = proxyString.split(":");

      const context = await browser.newContext({
        /*proxy: {
          server: `http://${server}:${port}`,
          username,
          password,
        },*/
      });

      const page = await context.newPage();
      page.isAvailable = true;
      pages.push({ page, context }); // Сохраняем страницу и контекст для управления доступностью
    }
  } catch (error) {
    console.error("Error initializing browser:", error);
    process.exit(1);
  }
})();

async function fetchHtml(url) {
  try {
    await pagePool.onIdle();
    const pageContext = pages.find((pc) => pc.page.isAvailable);
    if (!pageContext) throw new Error("No available pages");
    const { page } = pageContext;
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

app.get("/r2/", async (req, res) => {
  const url = req.query.urlsdj;

  if (!url) {
    res.status(400).send("URL parameter is missing");
    return;
  }

  try {
    const html = await fetchHtml(url);
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
  console.log(`Server listening on port ${PORT}`);
});

async function closeServer() {
  console.log("Closing server...");

  try {
    for (const { page, context } of pages) {
      try {
        if (page) await page.close();
      } catch (error) {
        console.error("Error closing page:", error);
      }
      try {
        if (context) await context.close();
      } catch (error) {
        console.error("Error closing context:", error);
      }
    }

    if (browser) await browser.close();
  } catch (error) {
    console.error("Error during shutdown:", error);
  } finally {
    process.exit();
  }
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
process.on("uncaughtException", (error) => {
  console.error("Unexpected error", error);
  // Here you could add logic for recovery, like restarting the browser or page
});
