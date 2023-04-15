import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import {HNSWLib} from "langchain/vectorstores/hnswlib";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import path from "path"
import * as url from 'url';
import fs from "fs";

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
    for (const file of fs.readdirSync(directory)) {
        await fs.unlinkSync(path.join(directory, file));
        console.log(`cleared ${file}`)
    }
    return options;
}

async function queryStore(options = {
    vectorStore: null
}) {
    if(options.vectorStore === null){
        throw new Error("Please provide a vector store to perform the query.");
    }
    const result = await options.vectorStore.similaritySearch("hello world", 1);
    return result;
}

export default {
    createStore,
    loadStore,
    clearStore,
    queryStore
}