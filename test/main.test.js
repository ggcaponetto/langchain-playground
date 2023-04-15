import assert from "assert";
import hnswlib from "../src/components/hnswlib/hnswlib.js";
import langchainUtil from "../src/components/hnswlib/langchain-util.js";
import fs from "fs";
import path from "path";
import url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import openAI from "../src/components/chat/chat.js";
describe('hnswlib', function () {
    function isEmpty(path) {
        return fs.readdirSync(path).length === 0;
    }
    describe('#clearStore()', function () {
        it('should remove all the file contents of the storage path', async function () {
            let options = await hnswlib.clearStore()
            const directory = path.resolve(options.path);
            assert.equal(isEmpty(directory), true);
        });
    });
    describe('#createStore()', function () {
        it('should create the storage on storage path', async function () {
            let options = await hnswlib.createStore({
                textArray: ["Hello world", "Bye bye", "hello nice world"],
                metadataArray: [{id: 2}, {id: 1}, {id: 3}]
            })
            const directory = path.resolve(options.path);
            assert.equal(isEmpty(directory), false);
        });
    });
    describe('#loadStore()', function () {
        it('should load the storage from storage path and return a document query result', async function () {
            let loadedVectorStore = await hnswlib.loadStore()
            assert.equal(!!loadedVectorStore, true);
            let res = await hnswlib.queryStore({
                vectorStore: loadedVectorStore,
                query: "hello world",
                k: 1
            })
            assert.equal(!!res, true);
        });
    });
    describe('should split a large amount of text into an array of documents, embed and query', function () {
        it('should split a large amount of text into an array of documents, embed and query OpenAI', async function () {
            this.timeout(1000*60*5)
            let loadedDocs = await langchainUtil.loadText({
                path: path.resolve(`${__dirname}/text/SomeLongText.txt`)
            });

            let splittedDocs = await langchainUtil.split({
                text: loadedDocs[0].pageContent,
                recursiveSplitterOptions: {
                    chunkSize: 500,
                    chunkOverlap: 50,
                }
            })
            assert.equal(!!splittedDocs, true);

            // clear the store
            let options = await hnswlib.clearStore()
            const directory = path.resolve(options.path);
            assert.equal(isEmpty(directory), true);

            // create the store
            let createStoreOptions = await hnswlib.createStore({
                textArray: splittedDocs.map(splittedDoc => splittedDoc.pageContent),
                metadataArray: splittedDocs.map(splittedDoc => splittedDoc.metadata)
            })

            let loadedVectorStore = await hnswlib.loadStore()
            assert.equal(!!loadedVectorStore, true);
            let relevantDocs = await hnswlib.queryStore({
                vectorStore: loadedVectorStore,
                query: "dog begin howl",
                k: 3
            })

            let openAIResponse = await openAI.queryOpenAI({
                docs: relevantDocs,
                question: "Was it day or night when one dog after another began to howl?"
            })
            console.log(openAIResponse);
            assert.equal(!!openAIResponse, true);
        });
        it('should query a pre-existing vector store for docs and query open ai with k nearest docs', async function () {
            this.timeout(1000*60*5)
            let loadedVectorStore = await hnswlib.loadStore()
            assert.equal(!!loadedVectorStore, true);
            let relevantDocs = await hnswlib.queryStore({
                vectorStore: loadedVectorStore,
                query: "dog begin howl",
                k: 3
            })

            let openAIResponse = await openAI.queryOpenAI({
                docs: relevantDocs,
                question: "Was it day or night when one dog after another began to howl?"
            })
            console.log(openAIResponse);
            assert.equal(!!openAIResponse, true);
        });
    });
    describe('get rough embedding cost', function () {
        it('get rough embedding cost in dollars', async function () {
            this.timeout(1000*60*5)
            let loadedDocs = await langchainUtil.loadText({
                path: path.resolve(`${__dirname}/text/Bible.txt`)
            });

            let wholeText = loadedDocs.map(doc => doc.pageContent).join("");
            let dollarCost = langchainUtil.getRoughEmbeddingCost(wholeText);
            assert.notEqual(dollarCost, null);
        });
    });
    describe('embeds a text', function () {
        it('embeds a text using hashes as keys', async function () {
            this.timeout(1000*60*5)
            let {
                digest, dollarCost
            } = await hnswlib.embed({
                text: "porcodiocagnaccio"
            });
            console.log("This operation costed " + dollarCost.toFixed(8) + "$.")
            assert.notEqual(digest, null);
        });
    });
    describe('embeds a text from a file', function () {
        it('embeds a text from a file using hashes as keys', async function () {
            this.timeout(1000*60*5)
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
    describe('#queryLocalVectorStore()', function () {
        it('query a serialized vector store', async function () {
            this.timeout(1000*60*5)
            let response = await hnswlib.queryLocalVectorStore({
                path: path.resolve(`${__dirname}/../src/components/hnswlib/store/9b157f18d39964253724e41305120f9a32a2d48577807ff3b5369f813f9293dc`),
                vectorStoreQuery: "kyra",
                // openAIQuestion: "Bei Wem kann man buchen bei aurora cosmetics? Bitte antworte auf Deutsch.",
                openAIQuestion: "Was sind die Öffnungszeiten bei aurora cosmetics am Dienstag? Bitte antworte auf Deutsch.",
                k: 10
            });
            console.log("Got response form OpenAI", response)
            assert.notEqual(response, null);
        });
    });
});