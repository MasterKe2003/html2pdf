const { setTimeout } = require('node:timers/promises');
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const getBrowser = async () => {
  return await puppeteer.launch({
  headless: 'chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
};

app.get("/image", async (req, res) => {
  const website = req.query.website;
  if (!website) {
    return res.status(400).send("Missing 'website' query parameter");
  }

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
  });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.setViewport({ width: 1080, height: 5000 });
    await page.setBypassCSP(true); // 忽略 CSP，允许加载所有资源
    await page.goto(website, { waitUntil: 'networkidle0' });
    // 移除所有 img 和 iframe 元素的 loading="lazy" 属性
    await page.evaluate(() => {
      const images = document.querySelectorAll('img[loading="lazy"], iframe[loading="lazy"]');
      images.forEach(img => img.removeAttribute('loading'));
    });
    // 等待所有图片加载完毕
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) {
            return Promise.resolve();  // 图片已经加载完成
          }
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      );
    });
    await setTimeout(3000);
    const screenshot = await page.screenshot({ fullPage: true });
    res.setHeader("Content-Type", "image/png");
    res.end(screenshot, "binary");
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send(error.message);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get("/pdf", async (req, res) => {
  const website = req.query.website;
  if (!website) {
    return res.status(400).send("Missing 'website' query parameter");
  }

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
  });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setBypassCSP(true); // 忽略 CSP，允许加载所有资源
    await page.goto(website, { waitUntil: 'networkidle0' });
    // 移除所有 img 和 iframe 元素的 loading="lazy" 属性
    await page.evaluate(() => {
      const images = document.querySelectorAll('img[loading="lazy"], iframe[loading="lazy"]');
      images.forEach(img => img.removeAttribute('loading'));
    });
    // 等待所有图片加载完毕
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) {
            return Promise.resolve();  // 图片已经加载完成
          }
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      );
    });
    await setTimeout(3000);
    const pdf = await page.pdf({
      scale: 0.7,
      width: "1080px",
      height: "auto",
      format: "A4",
      printBackground: true
    });
    res.setHeader("Content-Type", "application/pdf");
    res.end(pdf, "binary");
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send(error.message);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(4000, "0.0.0.0", () => console.log("Listening on PORT: 4000"));
