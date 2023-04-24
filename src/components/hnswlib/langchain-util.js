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




export default {
    split,
    loadText,
    getRoughEmbeddingCost
}