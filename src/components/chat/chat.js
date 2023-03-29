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


export const run = async () => {
    const docs = [
        new Document({ pageContent: "Dogs are the best animals of the world according to swiss people."})
    ];


    const model = new ChatOpenAI({ temperature: 0 });

    const prompt = new PromptTemplate({
        template: "Print {foo}",
        inputVariables: ["foo"],
    });
    const llmChain = new LLMChain({ prompt, llm: model });

    const chain = loadQAMapReduceChain(model);

    const response = await chain.call({
        input_documents: docs,
        question: "What are the best animals according to people in Zürich?"
    });

    console.log(response);
};
export default {
    run
}