const puppeteer = require('puppeteer');

// Step 2
async function extractLinks(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: "domcontentloaded"
    });
    const links = await page.evaluate(() => {
        const linkElements = Array.from(document.querySelectorAll('a'));
        return linkElements.map(link => link.href);
    });
    await browser.close();
    // console.log(`extracted ${links.length} links`)
    return links;
}

// Step 4
async function crawlSite(url, options = {
    maxLinksOnUrl: 5,
    maxDepth: 0,
    currentDepth: 0,
    urlAccumulator: []
}) {
    let depth = options.currentDepth;
    let currentUrl = url;
    let urls = await extractLinks(currentUrl, options);
    const isAtMaxDepth = depth === options.maxDepth;
    // console.log(`Got ${urls.length} urls on depth ${depth}.`, urls);
    let filteredUrls = [...new Set(urls.filter(
        url => url.includes(currentUrl) && url.includes("#") === false && currentUrl !== url
    ))].splice(0, options.maxLinksOnUrl)
    console.log(`Got ${filteredUrls.length} filtered urls from ${url} on depth ${depth}`, filteredUrls);

    if(isAtMaxDepth){
        console.log(`Finished crawling on depth ${depth}/${options.maxDepth}.`, options);
        return options;
    } else {
        let promises = []
        for(const newUrl of filteredUrls){
            if(
                options.urlAccumulator.includes(newUrl) === false
            ){
                let tempOption = {
                    ...options,
                    currentDepth: depth + 1,
                    urlAccumulator: [...new Set([
                        ...options.urlAccumulator,
                        newUrl
                    ])]
                }
                promises.push(await crawlSite(newUrl, tempOption))
            }
        }
        let depthResults = await Promise.all(promises)
        return depthResults
    }
}

// Step 5
crawlSite('https://www.squarespace.com/', {
    maxLinksOnUrl: 5,
    maxDepth: 1,
    currentDepth: 0,
    urlAccumulator: []
});