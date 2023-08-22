import assert from "assert";
import hnswlib from "../src/components/hnswlib/hnswlib.js";
import langchainUtil from "../src/components/hnswlib/langchain-util.js";
import fs from "fs";
import path from "path";
import url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import openAI from "../src/components/chat/chat.js";
import crypto from "crypto";
import scraper from "../src/components/web-scraper/src/scraper.js";
describe('hnswlib', function () {
    function isEmpty(path) {
        return fs.readdirSync(path).length === 0;
    }
    it('scrape recursive', async function () {
        this.timeout(1000 * 60 * 20)
        let text = await scraper.scrapeRecursive(
            "https://www.binningen.ch/de/dienstleistungen/versorgung-umwelt/energie/energiestrategie.html/735",
            "",
            {
                depth: 1,
                maxLinks: 5,
                maxDepthLevel: 2,
                isHeadless: false,
                visitedUrls: new Set()
            }
        )
        assert.equal(!!text, true);
    });
    it('get rough embedding cost in dollars', async function () {
        this.timeout(1000*60*5)
        let loadedDocs = await langchainUtil.loadText({
            path: path.resolve(`${__dirname}/text/Website.txt`)
        });

        let wholeText = loadedDocs.map(doc => doc.pageContent).join("");
        let dollarCost = langchainUtil.getRoughEmbeddingCost(wholeText);
        console.log("cost: " + dollarCost)
        assert.notEqual(dollarCost, null);
    });
    it('embeds a text from file to a vector store', async function () {
        this.timeout(1000*60*5);
        let loadedDocs = await langchainUtil.loadText({
            path: path.resolve(`${__dirname}/text/Website.txt`)
        });
        let {
            digest, dollarCost
        } = await hnswlib.embed({
            text:  loadedDocs[0].pageContent, storeName: "Website"
        });
        console.log("This operation costed " + dollarCost.toFixed(8) + "$.")
        assert.notEqual(digest, null);
    });
    it('query a serialized vector store and ask OpenAI a question', async function () {
        this.timeout(1000*60*5)
        let response = await hnswlib.queryLocalVectorStore({
            path: path.resolve(`${__dirname}/../src/components/hnswlib/store/Website`),
            vectorStoreQuery: "Was für eine Energiestrategie hat die gemeinde?",
            openAIQuestion: "Hat die Gemeinde Binningen eine Energiestrategie? Bitte antworte auf Deutsch. Die Antwort soll im JSON format sein mit einem boolean value ja/nein. Eine kurze Erklärung soll im attribut 'summary' sein.",
            k: 5,
            openAIOptions: { temperature: 0 }
        });
        console.log("Got response form OpenAI", response.openAIResponse);
        console.log(JSON.stringify(response.openAIResponse))
        assert.notEqual(response, null);
    });

    const run = async (url, questionVS, questionChatGPT) => {
        let text = await scraper.scrapeRecursive(
            url,
            "",
            {
                depth: 1,
                maxLinks: 5,
                maxDepthLevel: 2,
                isHeadless: false,
                visitedUrls: new Set()
            }
        )
        assert.equal(!!text, true);
        let loadedDocs = await langchainUtil.loadText({
            path: path.resolve(`${__dirname}/text/Website.txt`)
        });

        let wholeText = loadedDocs.map(doc => doc.pageContent).join("");
        let dollarCost = langchainUtil.getRoughEmbeddingCost(wholeText);
        console.log("cost prediction: " + dollarCost)
        assert.notEqual(dollarCost, null);
        let loadedDocsFromVectorStore = await langchainUtil.loadText({
            path: path.resolve(`${__dirname}/text/Website.txt`)
        });
        let {
            digest, dollarCost: cost
        } = await hnswlib.embed({
            text:  loadedDocsFromVectorStore[0].pageContent, storeName: "Website"
        });
        console.log("This operation costed " + cost.toFixed(8) + "$.")
        assert.notEqual(digest, null);
        let response = await hnswlib.queryLocalVectorStore({
            path: path.resolve(`${__dirname}/../src/components/hnswlib/store/Website`),
            vectorStoreQuery: questionVS,
            openAIQuestion: questionChatGPT,
            k: 5,
            openAIOptions: { temperature: 0 }
        });
        console.log("Got response form OpenAI", response.openAIResponse);
        console.log(JSON.stringify(response.openAIResponse));
        console.log(`Antwort: ${JSON.parse(response?.openAIResponse?.text)?.summary}`);
        assert.notEqual(response, null);
    }
    it("scans the Binningen website and performs a chatGPT query on it (incl. PDF's)", async function (){
        let url = "https://www.binningen.ch/de/dienstleistungen/versorgung-umwelt/energie/energiestrategie.html/735";
        let questionVS = "Was für eine Energiestrategie hat die gemeinde?";
        let questionChatGPT = "Hat die Gemeinde Binningen eine Energiestrategie? Bitte antworte auf Deutsch. Die Antwort soll im JSON format sein mit einem boolean value ja/nein. Eine kurze Erklärung soll im attribut 'summary' sein.";
        this.timeout(1000 * 60 * 20);
        await run(url, questionVS, questionChatGPT);
    })
    it("scans the Köniz website and performs a chatGPT query on it (incl. PDF's)", async function (){
        let url = "https://www.koeniz.ch/wohnen/umwelt/energie/klima-und-energiepolitik/klimaschutzreglement.page/305#:~:text=K%C3%B6niz%20auf%20dem%20Weg%20zur,soll%20bereits%202035%20klimaneutral%20sein.";
        let questionVS = "Was für eine Energiestrategie hat die gemeinde?";
        let questionChatGPT = "Hat die Gemeinde Köniz eine Energiestrategie? Bitte antworte auf Deutsch. Die Antwort soll im JSON format sein mit einem boolean value ja/nein. Eine kurze Erklärung soll im attribut 'summary' sein.";
        this.timeout(1000 * 60 * 20);
        await run(url, questionVS, questionChatGPT);
    })
});