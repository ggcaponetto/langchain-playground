const puppeteer = require('puppeteer');

// Step 2
async function extractLinks(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    const links = (await page.evaluate(() => {
        const linkElements = Array.from(document.querySelectorAll('a'));
        return linkElements.map(link => link.href);
    })).filter(link => link.startsWith("http"));
    await browser.close();
    console.log(`extracted ${links.length} links`)
    return links;
}

// Step 3
async function crawl(url, visitedUrls = new Set(), options) {
    let allLinks = await extractLinks(url);
    const links = allLinks.splice(options.maxLinksPerSite);
    console.log(`crawling the first ${options.maxLinksPerSite} of the ${allLinks.length} links`)
    for (const link of links) {
        await crawl(link, visitedUrls, options);
        console.log("crawled", link)
        visitedUrls.add(url);
    }
}

// Step 4
async function crawlSite(url) {
    const masterList = [url];
    const maxLinksPerSite = 2;
    const maxMasterListSize = 10;
    let currentIndex = 0;
    while ((currentIndex < masterList.length) && masterList.length <= maxMasterListSize) {
        const currentUrl = masterList[currentIndex];
        await crawl(
            currentUrl,
            masterList.length > 0 ? new Set(masterList) : new Set(),
            {
                maxLinksPerSite,
                maxMasterListSize
            }
        );
        const newLinks = (await extractLinks(currentUrl)).splice(maxLinksPerSite);
        newLinks.forEach(link => {
            if (!masterList.includes(link)) {
                masterList.push(link);
            }
        });
        currentIndex++;
    }
}

// Step 5
crawlSite('https://www.swissenergyplanning.ch');