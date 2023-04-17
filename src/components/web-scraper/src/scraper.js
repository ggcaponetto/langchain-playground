const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require("path");
const url = require("url");

const startingUrl = 'https://www.tutti.ch/de/vi/zuerich/oberstrass/baby-kind/kleider-schuhe/olivgruene-adidas-sport-freizeit-schuhe-gr-us-7/54972612';
const domain = url.parse(startingUrl).hostname;
console.log("scanning domain", domain)

const visitedUrls = new Set();
let linkCount = 0;
let maxLinks = 10;
let maxDepthLevel = 1; // top level is 0
let text = "";


async function writeFileAsync(filename, data) {
    try {
        await fs.promises.writeFile(filename, data);
        console.log('The file has been saved!');
    } catch (error) {
        console.error(`Error saving file: ${error}`);
    }
}

async function scrape(url, depth = 0, maxDepthLevel = maxDepthLevel) {
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
    console.log(`scraped url nr ${linkCount} (${url}) at level ${depth}`)
    let temp = JSON.stringify(`\n\n##### ${url} #####\n\n ${textContent.trim()}`);
    text += temp.substring(1, temp.length-1);
    visitedUrls.add(url);
    linkCount++;

    const linkUrls = await page.evaluate(() => {
        const elements = document.querySelectorAll('a');
        return Array.from(elements).map(el => el.href);
    });

    for (const linkUrl of linkUrls) {
        if (visitedUrls.has(linkUrl)) {
            continue;
        }
        if (depth >= maxDepthLevel) {
            break;
        }
        if (linkCount >= maxLinks) {
            break;
        }
        if (linkUrl.startsWith('http') && linkUrl.includes(`${domain}`)) {
            await browser.close();
            await scrape(linkUrl, depth + 1, maxDepthLevel);
        }
    }
    await browser.close();
}

(async ()=>{
    await scrape(startingUrl, 0, maxDepthLevel);
    console.log(`Scraped the text of ${linkCount} links.`);
    await writeFileAsync(path.resolve(`${__dirname}/../store/${"MySite"}.txt`), text);
})()