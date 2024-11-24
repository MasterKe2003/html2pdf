const   express = require("express");
const  puppeteer = require("puppeteer-core");
 
const app = express();
 
const browserWSEndpoint = process.env.ENDPOINT ||  "ws://10.1.1.50:3003";
 
const getBrowser = async () => puppeteer.connect({ browserWSEndpoint });
 
app.get("/image", async (req, res) => {
  let  browser_local = null;
  const website  = req.query.website;
  await getBrowser()
    .then(async (browser) => {
     browser_local = browser
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 1024 });
      await page.goto(website,{
        waitUntil: ["load",'networkidle0'],
      });
      const screenshot = await page.screenshot({
        fullPage: true,
        captureBeyondViewport: true,
      });
      res.end(screenshot, "binary");
    })
    .catch((error) => {
      if (!res.headersSent) {
        res.status(400).send(error.message);
      }
    })
    .finally(() => browser_local && browser_local.close());
});
 
 
app.get("/pdf", async (req, res) => {
    let browser_local = null;
    const website  = req.query.website;
    await getBrowser()
      .then(async (browser) => {
        browser_local = browser
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1024 });
        await page.goto(website,{
          waitUntil: ["load",'networkidle0'],
        });
        const screenshot = await page.pdf({
            displayHeaderFooter: true,
            format: "A4",
            printBackground: true,
        });
        res.end(screenshot, "binary");
      })
      .catch((error) => {
        if (!res.headersSent) {
          res.status(400).send(error.message);
        }
      })
      .finally(() => browser_local && browser_local.close());
  });
 
 
app.listen(3004,'0.0.0.0', () => console.log("Listening on PORT: 3004"));