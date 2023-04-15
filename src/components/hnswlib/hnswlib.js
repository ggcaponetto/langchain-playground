import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import {HNSWLib} from "langchain/vectorstores/hnswlib";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import path from "path"
import * as url from 'url';
import fs from "fs";
import langchainUtil from "./langchain-util.js";
import assert from "assert";
import * as crypto from "crypto";
import openAI from "../chat/chat.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const test = async () => {
    // Create a vector store through any method, here from texts as an example
    const vectorStore = await HNSWLib.fromTexts(
        ["Hello world", "Bye bye", "hello nice world"],
        [{id: 2}, {id: 1}, {id: 3}],
        new OpenAIEmbeddings()
    );

    // Save the vector store to a directory
    const directory = path.resolve(`${__dirname}/store`);
    await vectorStore.save(directory);

    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load(
        directory,
        new OpenAIEmbeddings()
    );

    // vectorStore and loadedVectorStore are identical

    const result = await loadedVectorStore.similaritySearch("hello world", 1);
    console.log(result);
};

async function createStore(options = {
    textArray: [],
    metadataArray: [],
    path: `${__dirname}/store`
}) {
    const defaultOptions = {
        textArray: [],
        metadataArray: [],
        path: options.path ? options.path : `${__dirname}/store`,
    }
    const opts = {
        ...options,
        textArray: options.textArray === undefined ? defaultOptions.textArray : options.textArray,
        metadataArray: options.metadataArray === undefined ? defaultOptions.metadataArray : options.metadataArray,
        path: options.path === undefined ? defaultOptions.path : options.path
    }
    // Create a vector store through any method, here from texts as an example
    const vectorStore = await HNSWLib.fromTexts(
        opts.textArray,
        opts.metadataArray,
        new OpenAIEmbeddings()
    );

    // Save the vector store to a directory
    const directory = path.resolve(opts.path);
    await vectorStore.save(directory);
    return opts;
}
async function loadStore(options = {
    path: `${__dirname}/store`
}) {
    const directory = path.resolve(options.path);
    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load(
        directory,
        new OpenAIEmbeddings()
    );
    return loadedVectorStore;
}

async function clearStore(options = {
    path: `${__dirname}/store`
}) {
    const directory = path.resolve(options.path);
    // Load the vector store from the same directory
    if(fs.existsSync(directory)){
        for (const file of fs.readdirSync(directory)) {
            await fs.unlinkSync(path.join(directory, file));
            console.log(`cleared ${file}`)
        }
    }
    return options;
}

async function queryStore(options = {
    vectorStore: null,
    query: "",
    k: 10
}) {
    if(options.vectorStore === null){
        throw new Error("Please provide a vector store to perform the query.");
    }
    const result = await options.vectorStore.similaritySearch(options.query, options.k);
    return result;
}

async function embed({
                         text
                     }){
    let dollarCost = langchainUtil.getRoughEmbeddingCost(text);
    if(dollarCost > 1){
        throw new Error(`This operation is too pricey! ${dollarCost.toFixed(8)}$`)
    }
    let splittedDocs = await langchainUtil.split({
        text: text,
        recursiveSplitterOptions: {
            chunkSize: 500,
            chunkOverlap: 50,
        }
    })
    const hash = crypto.createHash('sha256');
    // update the hash object with the data to be hashed
    hash.update(text);
    // generate the hash digest in hexadecimal format
    const digest = hash.digest('hex');

    // clear the store
    let storePath = path.resolve(`${__dirname}/store/${digest}`);
    let options = await clearStore({
        path: storePath
    })
    const directory = path.resolve(storePath);

    // create the store
    let createStoreOptions = await createStore({
        textArray: splittedDocs.map(splittedDoc => splittedDoc.pageContent),
        metadataArray: splittedDocs.map(splittedDoc => splittedDoc.metadata),
        path: storePath
    })
    return {
        digest: digest,
        dollarCost: dollarCost
    };
}

async function queryLocalVectorStore(options = {
    path: null,
    vectorStoreQuery: "",
    openAIQuestion: "",
    k: 3
}){
    let loadedVectorStore = await loadStore({
        path: options.path
    })
    let relevantDocs = await queryStore({
        vectorStore: loadedVectorStore,
        query: options.vectorStoreQuery,
        k: options.k
    })

    let openAIResponse = await openAI.queryOpenAI({
        docs: relevantDocs,
        question: options.openAIQuestion
    })
    return openAIResponse;
}

export default {
    createStore,
    loadStore,
    clearStore,
    queryStore,
    embed,
    queryLocalVectorStore
}