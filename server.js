// server.js
const express = require("express");
const { firefox } = require("playwright");

const app = express();
const PORT = 30823;

let browser;
let context;

(async () => {
  try {
    browser = await firefox.launch({ headless: true });
    context = await browser.newContext();
  } catch (error) {
    console.error("Error initializing browser:", error);
    process.exit(1);
  }
})();

app.get("/r2/", async (req, res) => {
  const url = req.query.urlsdj;

  if (!url) {
    res.send("ok");
    return;
  }

  try {
    const page = await context.newPage();

    await page.goto(url);

    const html = await page.content();

    await page.close();

    res.send(html);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/", async (req, res) => {
  res.send("👋");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
