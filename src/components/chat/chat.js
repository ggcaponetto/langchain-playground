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
        new Document({ pageContent: "Ich bin Aurora un ich spiele gerne Beachsoccer"}),
        new Document({ pageContent: "Ich bin Giuseppe und ich spiele gerne Fussball. Fussball zu spielen ist mein grösstes Hobby."}),
    ];
    docs = [
        ...docs
    ]
    const model = new ChatOpenAI({ temperature: 0 });
    const chain = loadQAMapReduceChain(model);
    const response = await chain.call({
        input_documents: docs,
        question: "Sag mir den Namen von zwei Personen die gerne Fussball spielen."
    });

    console.log(response);
};
export default {
    run
}