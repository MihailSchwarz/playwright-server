// server.js
const express = require("express");
const { firefox } = require("playwright");

const app = express();
const PORT = 3000;

let browser;
let context;

(async () => {
  browser = await firefox.launch({ headless: true });
  context = await browser.newContext();
})();

app.get("/", async (req, res) => {
  const url = req.query.url;

  const page = await context.newPage();
  const url2 =
    "https://services.rome2rio.com/api/1.5/json/search?key=jGq3Luw3&oName=%D0%9F%D1%80%D0%B0%D0%B3%D0%B0%2C+%D0%98%D1%81%D0%BF%D0%B0%D0%BD%D0%B8%D1%8F&dName=%D0%90%D0%BB%D0%B8%D0%BA%D0%B0%D0%BD%D1%82%D0%B5%2C+%D0%98%D1%81%D0%BF%D0%B0%D0%BD%D0%B8%D1%8F&languageCode=ru&currencyCode=EUR&uid=ISRey20210619084420183ufdd&aqid=ISRey20210619084420183ufdd&analytics=false&debugFeatures=false&groupOperators=false";
  await page.goto(url);

  const html = await page.content();
  //console.log(html);

  await page.close();

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
