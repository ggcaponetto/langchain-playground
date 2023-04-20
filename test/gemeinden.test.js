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
describe('hnswlib', function () {
    function isEmpty(path) {
        return fs.readdirSync(path).length === 0;
    }
    describe('get rough embedding cost', function () {
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
    });
    describe('embeds a text', function () {
        it('embeds a text using hashes as keys', async function () {
            this.timeout(1000*60*5)
            let {
                digest, dollarCost
            } = await hnswlib.embed({
                text: "Dante Alighieri wrote the book \"ChatGPT will destroy humanity\""
            });
            console.log("This operation costed " + dollarCost.toFixed(8) + "$.")
            assert.notEqual(digest, null);
        });
    });
    describe('#queryLocalVectorStore() + query OpenAI', function () {
        it('query a serialized vector store and ask OpenAI a question', async function () {
            this.timeout(1000*60*5)
            let response = await hnswlib.queryLocalVectorStore({
                path: path.resolve(`${__dirname}/../src/components/hnswlib/store/e3e9081b185c7d38a1147aa862182ce9fcee74f53a94ed614e8fee6912c2ffdc`),
                vectorStoreQuery: "öffnungszeiten",
                openAIQuestion: "Hat die Gemeinde oensingen bestimmte Öffnungszeiten? Bitte antworte auf Deutsch.",
                k: 20
            });
            console.log("Got response form OpenAI", response)
            assert.notEqual(response, null);
        });
    });
    describe('embed text from file as to vector store + #queryLocalVectorStore() + query OpenAI', function () {
        it('embeds a text from file using hashes as keys', async function () {
            this.timeout(1000*60*5);
            let loadedDocs = await langchainUtil.loadText({
                path: path.resolve(`${__dirname}/text/Website.txt`)
            });
            let {
                digest, dollarCost
            } = await hnswlib.embed({
                text:  loadedDocs[0].pageContent
            });
            console.log("This operation costed " + dollarCost.toFixed(8) + "$.")
            assert.notEqual(digest, null);
        });
    });
});