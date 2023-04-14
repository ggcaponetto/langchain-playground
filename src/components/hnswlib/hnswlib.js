import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import path from "path"
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const run = async () => {
    // Create a vector store through any method, here from texts as an example
    const vectorStore = await HNSWLib.fromTexts(
        ["Hello world", "Bye bye", "hello nice world"],
        [{ id: 2 }, { id: 1 }, { id: 3 }],
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

run();