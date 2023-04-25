import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import path from "path"
import * as url from 'url';
import fs from "fs";
import { TextLoader } from "langchain/document_loaders/fs/text";
import axios from "axios"

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


async function split(options = {
    text: "",
    recursiveSplitterOptions: null
}) {
    const splitter = new RecursiveCharacterTextSplitter(options.recursiveSplitterOptions);
    const output = await splitter.createDocuments([options.text]);
    return output;
}

async function loadText(options = {
    path: null
}) {
    const loader = new TextLoader(options.path);
    const docs = await loader.load();
    return docs;
}

function getRoughEmbeddingCost(text){
    // based on https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
    const charsPerPage = 1800;
    let pages = text.length / charsPerPage;
    let dollarCost = pages/3000;
    return dollarCost;
}

export default {
    split,
    loadText,
    getRoughEmbeddingCost
}