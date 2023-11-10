import puppeteer from "puppeteer";

async function scheduleEvent(url, fullName, email) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector("#full_name_input");
  await page.type("#full_name_input", fullName);

  await page.waitForSelector("#email_input");
  await page.type("#email_input", email);

  await page.click(
    "button.b1hdxvdx.u1xbh6v5.b1qhbqhv.d1bkmipt.smqpqx8.f41u73q"
  );

  await browser.close();
}
