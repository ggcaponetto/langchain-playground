import {ConversationChain, LLMChain, loadQAMapReduceChain, StuffDocumentsChain} from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder, PromptTemplate,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { Document } from "langchain/document";
import {UnstructuredLoader} from "langchain/document_loaders";

async function queryOpenAI(options = {
    docs: [],
    question: ""
}){
    const model = new ChatOpenAI({ temperature: 0 });
    const chain = loadQAMapReduceChain(model);
    const response = await chain.call({
        input_documents: options.docs,
        question: options.question
    });
    return response;
}
export default {
    queryOpenAI
}