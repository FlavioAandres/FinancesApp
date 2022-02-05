const chromium = require('chrome-aws-lambda');
const puppeteer = require("puppeteer-core")

const acceptInvitation = async (url) => {
    return new Promise(async (resolve, reject) => {
        let browser; 
        try {
            browser = await chromium.puppeteer.launch({
                executablePath: await chromium.executablePath,
                args: [...chromium.args, '--enable-features=NetworkService'],
                defaultViewport: chromium.defaultViewport,
                headless: chromium.headless,
            });

            const [page] = await browser.pages();

            await page.goto(url, {
                waitUntil: ["networkidle0", "load", "domcontentloaded"]
            });

            await page.waitForTimeout(3000);
            
            await page.click('input[type=submit]')

            await page.waitForTimeout(1000);

            await browser.close()

            resolve('accepted')
        } catch (error) {
            if(browser){
                await browser.close(); 
            }
            reject(error)
        }
    });


}

module.exports = {
    acceptInvitation
}