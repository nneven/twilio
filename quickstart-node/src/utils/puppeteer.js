import puppeteer from "puppeteer";

export async function scheduleEvent(url, fullName, email) {
  // const browser = await puppeteer.launch({headless: 'new'});
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({ width: 1920, height: 1080 });

  await page.waitForSelector("#full_name_input");
  await page.type("#full_name_input", fullName);

  await page.waitForSelector("#email_input");
  await page.type("#email_input", email);

  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  await browser.close();

  return true;
}
