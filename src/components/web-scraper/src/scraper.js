import puppeteer from "puppeteer";
import fs from "fs"
import path from "path"
import * as urlLib from "url"
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import https from "https"
import assert from "assert";

const __filename = urlLib.fileURLToPath(import.meta.url);
const __dirname = urlLib.fileURLToPath(new URL('.', import.meta.url));

async function writeFileAsync(filename, data) {
    try {
        await fs.promises.writeFile(filename, data);
        console.log(`The file ${filename} has been saved!`);
    } catch (error) {
        console.error(`Error saving file: ${error}`);
    }
}

async function loadUnstructured(links) {
    const loader = new UnstructuredLoader(...links);
    const docs = await loader.load();
    return docs;
}

async function download (url, targetFile) {
    return await new Promise((resolve, reject) => {
        https.get(url, response => {
            const code = response.statusCode ?? 0

            if (code >= 400) {
                return reject(new Error(response.statusMessage))
            }

            // handle redirects
            if (code > 300 && code < 400 && !!response.headers.location) {
                return resolve(
                    download(response.headers.location, targetFile)
                )
            }

            // save the file to disk
            const fileWriter = fs
                .createWriteStream(targetFile)
                .on('finish', () => {
                    resolve({})
                })

            response.pipe(fileWriter)
        }).on('error', error => {
            reject(error)
        })
    })
}

async function scrape(url, text, options) {
    const domain = urlLib.parse(url).hostname;

    if (options.depth > options.maxDepthLevel) {
        return text;
    }
    if (options.visitedUrls.size >= options.maxLinks) {
        return text;
    }
    if (
        options.visitedUrls.has(url)
    ) {
        return text;
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: options.isHeadless
        });
        const page = await browser.newPage();
        await page.goto(url);

        const isPDF = url.toLowerCase().includes(".pdf")
        let textContent = "";
        if(isPDF){
            let res = await download(
                url,
                path.resolve(`${__dirname}/../temp/temp.pdf`),
            )
            assert.equal(!!res, true);

            let docs = await loadUnstructured([
                "http://localhost:8000/general/v0/general",
                path.resolve(`${__dirname}/../temp/temp.pdf`),
            ])
            textContent = docs.map(d => d.pageContent).join("\n");
        } else {
            textContent = await page.evaluate(() => {
                const elements = document.querySelectorAll('body div');
                return Array.from(elements).map(
                    el => el.textContent
                        .trim()
                ).join('\n');
            });
        }
        console.log(`scraped url (isPDF: ${isPDF.toString()}) nr ${options.visitedUrls.size + 1}/${options.maxLinks} (${url}) at level ${options.depth}/${options.maxDepthLevel}`)
        let temp = JSON.stringify(`\n\n##### ${url} #####\n\n ${textContent.trim()}`);
        text += temp.substring(1, temp.length-1);
        options.visitedUrls.add(url);

        const linkUrls = await page.evaluate(() => {
            const elements = document.querySelectorAll('a');
            return Array.from(elements).map(el => el.href);
        });

        let levelDepth = options.depth + 1
        for (let i = 0; i < linkUrls.length; i++) {
            const linkUrl = linkUrls[i]
            if (
                linkUrl.startsWith('http')
                && linkUrl.includes(`${domain}`)
                && (linkUrl.toLowerCase().includes(`.pdf`))
            ) {
                await browser.close();
                text = await scrape(linkUrl, text, {
                    ...options,
                    depth: levelDepth
                });
            }
        }
        await browser.close();
        return text;
    } catch (e){
        console.warn("had an error scrapring the url " + url)
        try {
            await browser.close();
        } catch (e){
            console.warn("had an error closing the browser on url " + url)
        }
    }
}

async function scrapeRecursive(startingUrl, text, options){
    let textOutput = await scrape(startingUrl, text, options);
    console.log(`Scraped the text of ${options.visitedUrls.size} links.`);
    await writeFileAsync(path.resolve(`${__dirname}/../store/Website.txt`), textOutput);
    await writeFileAsync(path.resolve(`${__dirname}/../../../../test/text/Website.txt`), textOutput);
    return textOutput;
}

export default {
    scrape,
    loadUnstructured,
    download,
    scrapeRecursive
}
