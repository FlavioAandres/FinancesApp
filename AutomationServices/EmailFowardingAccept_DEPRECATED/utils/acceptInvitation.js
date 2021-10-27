const chromium = require('chrome-aws-lambda');
const puppeteer = require("puppeteer-core")

const acceptInvitation = async (url) => {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await chromium.puppeteer.launch({
                executablePath: await chromium.executablePath,
                args: [...chromium.args, '--enable-features=NetworkService'],
                defaultViewport: chromium.defaultViewport,
                headless: chromium.headless,
            });

            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: ["networkidle0", "load", "domcontentloaded"]
            });

            await page.waitForTimeout(3000);
            
            await page.click('input[type=submit]')

            await page.waitForTimeout(1000);

            await browser.close()

            resolve('accepted')
        } catch (error) {
            reject(error)
        }
    });


}

module.exports = {
    acceptInvitation
}