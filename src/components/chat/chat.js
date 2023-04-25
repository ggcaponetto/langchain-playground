import {ConversationChain, LLMChain, loadQAMapReduceChain, StuffDocumentsChain} from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder, PromptTemplate,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { Document } from "langchain/document";

async function queryOpenAI(options = {
    docs: [],
    question: "",
    openAIOptions: {
        temperature: 0
    }
}){
    const model = new ChatOpenAI(options.openAIOptions);
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