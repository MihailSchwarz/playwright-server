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
"185.126.66.84:7600:zrguskhf:pitpbu81akov",
"154.194.8.43:5574:zrguskhf:pitpbu81akov",
"206.41.172.122:6682:zrguskhf:pitpbu81akov",
"64.137.10.164:5814:zrguskhf:pitpbu81akov",
"194.39.34.166:6178:zrguskhf:pitpbu81akov",
"209.99.165.29:5934:zrguskhf:pitpbu81akov",
"216.173.122.17:5744:zrguskhf:pitpbu81akov",
"154.95.0.193:6446:zrguskhf:pitpbu81akov",
"156.238.9.92:6983:zrguskhf:pitpbu81akov",
"91.246.193.29:6286:zrguskhf:pitpbu81akov",
"64.137.57.130:6139:zrguskhf:pitpbu81akov",
"109.207.130.48:8055:zrguskhf:pitpbu81akov",
"113.30.155.105:6113:zrguskhf:pitpbu81akov",
"104.238.9.114:6567:zrguskhf:pitpbu81akov",
"77.83.233.26:6644:zrguskhf:pitpbu81akov",
"193.27.19.170:7256:zrguskhf:pitpbu81akov",
"45.154.84.244:8295:zrguskhf:pitpbu81akov",
"45.131.94.207:6194:zrguskhf:pitpbu81akov",
"113.30.155.251:6259:zrguskhf:pitpbu81akov",
"185.126.66.138:7654:zrguskhf:pitpbu81akov",
"193.23.245.172:8743:zrguskhf:pitpbu81akov",
"64.137.42.221:5266:zrguskhf:pitpbu81akov",
"45.130.128.76:9093:zrguskhf:pitpbu81akov",
"154.85.101.21:5452:zrguskhf:pitpbu81akov",
"104.233.19.20:5692:zrguskhf:pitpbu81akov",
"194.39.32.114:6411:zrguskhf:pitpbu81akov",
"185.102.50.179:7262:zrguskhf:pitpbu81akov",
"45.131.94.216:6203:zrguskhf:pitpbu81akov",
"77.83.233.118:6736:zrguskhf:pitpbu81akov",
"64.137.42.31:5076:zrguskhf:pitpbu81akov",
"156.238.7.53:6065:zrguskhf:pitpbu81akov",
"104.239.76.20:6679:zrguskhf:pitpbu81akov",
"156.238.5.244:5585:zrguskhf:pitpbu81akov",
"104.239.76.246:6905:zrguskhf:pitpbu81akov",
"194.39.33.72:5781:zrguskhf:pitpbu81akov",
"104.233.19.53:5725:zrguskhf:pitpbu81akov",
"193.27.21.67:8154:zrguskhf:pitpbu81akov",
"193.5.65.20:8526:zrguskhf:pitpbu81akov",
"104.239.82.8:5689:zrguskhf:pitpbu81akov",
"45.131.103.250:6236:zrguskhf:pitpbu81akov",
"45.8.134.171:7187:zrguskhf:pitpbu81akov",
"45.131.92.210:6821:zrguskhf:pitpbu81akov",
"109.207.130.251:8258:zrguskhf:pitpbu81akov",
"185.126.65.201:6998:zrguskhf:pitpbu81akov",
"45.8.134.104:7120:zrguskhf:pitpbu81akov",
"156.238.5.121:5462:zrguskhf:pitpbu81akov",
"77.83.233.217:6835:zrguskhf:pitpbu81akov",
"45.153.22.141:6081:zrguskhf:pitpbu81akov",
"185.102.50.157:7240:zrguskhf:pitpbu81akov",
"104.143.246.24:5979:zrguskhf:pitpbu81akov",
"194.33.61.45:8628:zrguskhf:pitpbu81akov",
"193.8.1.115:6652:zrguskhf:pitpbu81akov",
"104.233.19.83:5755:zrguskhf:pitpbu81akov",
"194.33.61.44:8627:zrguskhf:pitpbu81akov",
"104.143.246.254:6209:zrguskhf:pitpbu81akov",
"45.154.84.190:8241:zrguskhf:pitpbu81akov",
"91.246.195.28:6797:zrguskhf:pitpbu81akov",
"104.222.187.221:6345:zrguskhf:pitpbu81akov",
"193.27.23.43:9131:zrguskhf:pitpbu81akov",
"216.173.98.214:6216:zrguskhf:pitpbu81akov",
"193.27.23.160:9248:zrguskhf:pitpbu81akov",
"193.27.19.143:7229:zrguskhf:pitpbu81akov",
"109.207.130.40:8047:zrguskhf:pitpbu81akov",
"193.27.10.54:6139:zrguskhf:pitpbu81akov",
"104.239.98.10:6041:zrguskhf:pitpbu81akov",
"185.102.48.143:6225:zrguskhf:pitpbu81akov",
"193.8.1.108:6645:zrguskhf:pitpbu81akov",
"104.239.82.37:5718:zrguskhf:pitpbu81akov",
"185.102.48.186:6268:zrguskhf:pitpbu81akov",
"156.238.5.34:5375:zrguskhf:pitpbu81akov",
"193.8.1.182:6719:zrguskhf:pitpbu81akov",
"193.23.245.134:8705:zrguskhf:pitpbu81akov",
"194.33.29.227:7811:zrguskhf:pitpbu81akov",
"91.246.194.16:6529:zrguskhf:pitpbu81akov",
"91.246.195.109:6878:zrguskhf:pitpbu81akov",
"45.153.22.34:5974:zrguskhf:pitpbu81akov",
"193.8.94.98:9143:zrguskhf:pitpbu81akov",
"185.102.50.71:7154:zrguskhf:pitpbu81akov",
"194.39.32.7:6304:zrguskhf:pitpbu81akov",
"156.238.9.51:6942:zrguskhf:pitpbu81akov",
"104.239.76.84:6743:zrguskhf:pitpbu81akov",
"64.137.42.79:5124:zrguskhf:pitpbu81akov",
"91.246.194.192:6705:zrguskhf:pitpbu81akov",
"185.102.49.107:6445:zrguskhf:pitpbu81akov",
"185.102.49.1:6339:zrguskhf:pitpbu81akov",
"156.238.10.14:5096:zrguskhf:pitpbu81akov",
"216.173.108.117:6732:zrguskhf:pitpbu81akov",
"45.130.128.112:9129:zrguskhf:pitpbu81akov",
"193.8.231.229:9235:zrguskh

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
