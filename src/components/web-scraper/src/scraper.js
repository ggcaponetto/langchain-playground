const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require("path");

const domain = 'aurora-cosmetics.ch';
const visitedUrls = new Set();
let linkCount = 0;
let maxLinks = 20;
let maxDepth = 10;
let text = "";


async function writeFileAsync(filename, data) {
    try {
        await fs.promises.writeFile(filename, data);
        console.log('The file has been saved!');
    } catch (error) {
        console.error(`Error saving file: ${error}`);
    }
}

async function scrape(url, depth = 0, maxDepth = maxDepth) {
    if (linkCount >= maxLinks || depth >= maxDepth) {
        return;
    }
    visitedUrls.add(url);
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(url);

    const textContent = await page.evaluate(() => {
        const elements = document.querySelectorAll('body div');
        return Array.from(elements).map(
            el => el.textContent
                .trim()
        ).join('\n');
    });
    console.log("scraped " + url)
    let temp = JSON.stringify(`\n\n##### ${url} #####\n\n ${textContent.trim()}`);
    text += temp.substring(1, temp.length-1);

    const linkUrls = await page.evaluate(() => {
        const elements = document.querySelectorAll('a');
        return Array.from(elements).map(el => el.href);
    });

    for (const linkUrl of linkUrls) {
        if (visitedUrls.has(linkUrl)) {
            continue;
        }
        if (linkUrl.startsWith('https') && linkUrl.includes(domain)) {
            linkCount++;
            await scrape(linkUrl, depth + 1, maxDepth);
        }
        if (linkCount >= maxLinks) {
            break;
        }
    }

    await browser.close();
}

(async ()=>{
    await scrape(`https://${domain}`, 0, maxDepth);
    console.log(`Scraped the text of ${linkCount} links.`);
    await writeFileAsync(path.resolve(`${__dirname}/../store/${domain}.txt`), text);
})()