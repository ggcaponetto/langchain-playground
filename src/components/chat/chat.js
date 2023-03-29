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


export const run = async () => {
    let docs = [
        new Document({ pageContent: "Dogs are the best animals of the world according to swiss people."}),
        new Document({ pageContent: "Dogs are the best animals of the world according to people living in Zug."}),
        new Document({ pageContent: "Zug is a swiss town that is 20km from Zürich."})
    ];
    docs = [
        ...docs
    ]
    const model = new ChatOpenAI({ temperature: 0 });
    const chain = loadQAMapReduceChain(model);
    const response = await chain.call({
        input_documents: docs,
        question: "What are the best animals according to people switzerland?"
    });

    console.log(response);
};
export default {
    run
}