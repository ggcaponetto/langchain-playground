import assert from "assert";
import fs from "fs";
import url from "url";
import scraper from "../src/scraper.js"
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
describe('scrape', function () {
    function isEmpty(path) {
        return fs.readdirSync(path).length === 0;
    }
    describe('scrape recursive', async function () {
        it('scrape recursive', async function () {
            this.timeout(1000 * 60 * 20)
            let text = await scraper.scrapeRecursive(
                "https://www.binningen.ch/de/dienstleistungen/versorgung-umwelt/energie/energiestrategie.html/735",
                "",
                {
                    depth: 1,
                    maxLinks: 100,
                    maxDepthLevel: 3,
                    isHeadless: false,
                    visitedUrls: new Set()
                }
            )
            assert.equal(!!text, true);
        });
        it('scrapes one link', async function () {
            this.timeout(1000 * 60)
            let text = await scraper.scrape(
                "https://www.binningen.ch/de/dienstleistungen/versorgung-umwelt/energie/elektrizitaet.html/722",
                "",
                {
                    depth: 1,
                    maxLinks: 1,
                    maxDepthLevel: 1,
                    isHeadless: false,
                    visitedUrls: new Set()
                }
            )
            assert.equal(!!text, true);
            let pdfText = await scraper.scrape(
                "https://www.binningen.ch/public/upload/assets/3120/205_Energiestrategie_Binningen_1.pdf",
                "",
                {
                    depth: 1,
                    maxLinks: 1,
                    maxDepthLevel: 1,
                    isHeadless: false,
                    visitedUrls: new Set()
                }
            )
            assert.equal(!!pdfText, true);
        });
        it('loads a file from disk', async function () {
            this.timeout(1000 * 60)
            let docs = await scraper.loadUnstructured([
                "http://localhost:8000/general/v0/general",
                "test/files/205_Energiestrategie_Binningen_1.pdf",
            ])
            assert.equal(docs.length > 0, true);
        });
        it('downloads a temp file on disk and loads it', async function () {
            this.timeout(1000 * 60)
            let res = await scraper.download(
                "https://www.binningen.ch/public/upload/assets/3120/205_Energiestrategie_Binningen_1.pdf",
                "test/files/temp.pdf"
            )
            assert.equal(!!res, true);

            let docs = await scraper.loadUnstructured([
                "http://localhost:8000/general/v0/general",
                "test/files/temp.pdf",
            ])
            assert.equal(docs.length > 0, true);
        });
    });
});