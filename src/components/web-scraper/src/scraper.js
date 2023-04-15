const puppeteer = require('puppeteer');

// Step 2
async function extractLinks(url) {
    const browser = await puppeteer.launch({ headless: true });
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
async function crawlSite(url, options) {
    const isAtMaxDepth = options.currentDepth === options.maxDepth;
    if(isAtMaxDepth){
        options.results = [
            ...new Set([
                ...options.results,
                url
            ])
        ]
        console.log(`Finished crawling on depth ${options.currentDepth}/${options.maxDepth}.`, options);
        return new Promise((res) => {res(options)})
    } else {
        let urls = await extractLinks(url, options);
        // console.log(`Got ${urls.length} urls on depth ${depth}.`, urls);
        let filteredUrls = [...new Set(urls.filter(
            myUrl => myUrl.includes(url) && myUrl.includes("#") === false && url !== myUrl
        ))].splice(0, options.maxLinksOnUrl)
        console.log(`Got ${filteredUrls.length} filtered urls from ${url} on depth ${options.currentDepth}`, filteredUrls);
        const promises = [];
        for(const newUrl of filteredUrls){
            if(
                options.urlAccumulator.includes(newUrl) === false
            ){
                let tempOption = {
                    ...options,
                    currentDepth: options.currentDepth + 1,
                    urlAccumulator: [...new Set([
                        ...options.urlAccumulator,
                        newUrl
                    ])],
                    results: [
                        ...new Set([
                            ...options.results,
                            newUrl
                        ])
                    ]
                }
                const tempPromise = crawlSite(newUrl, tempOption).then(r => r);
                promises.push(tempPromise);
            }
        }
        let results = []
        for (const promise of promises) {
            results.push(await Promise.resolve(promise))
        }
        return results;
    }
}

// Step 5
(async ()=>{
    let crawlingResult = await crawlSite('https://www.squarespace.com/', {
        maxLinksOnUrl: 5,
        maxDepth: 3,
        currentDepth: 0,
        urlAccumulator: [],
        results: []
    });
    console.log(`Crawling result`, crawlingResult)
})()