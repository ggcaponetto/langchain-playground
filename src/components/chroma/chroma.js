import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
// import { Chroma } from "langchain/vectorstores/chroma";
const { Chroma } = await import('langchain/vectorstores/chroma');
const { OpenAIEmbeddings } = await import('langchain/embeddings/openai');


// text sample from Godel, Escher, Bach
const vectorStore = await Chroma.fromTexts(
    [
        "Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little\
            Harmonic Labyrinth of the dreaded Majotaur?",
        "Achilles: Yiikes! What is that?",
        "Tortoise: They say-although I person never believed it myself-that an I\
            Majotaur has created a tiny labyrinth sits in a pit in the middle of\
            it, waiting innocent victims to get lost in its fears complexity.\
            Then, when they wander and dazed into the center, he laughs and\
            laughs at them-so hard, that he laughs them to death!",
        "Achilles: Oh, no!",
        "Tortoise: But it's only a myth. Courage, Achilles.",
    ],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new OpenAIEmbeddings(),
    {
        collectionName: "goldel-escher-bach",
    }
);

// or alternatively from docs
/*const vectorStore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName: "goldel-escher-bach",
});*/

const response = await vectorStore.similaritySearch("scared", 2);
console.log("chroma db search result: ", response);