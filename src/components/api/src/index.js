import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import express from "express"
import cors from "cors"
import langchainUtil from "../../hnswlib/langchain-util.js";
import hnswlib from "../../hnswlib/hnswlib.js";
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json(
    {
        limit: "50mb"
    }
));
app.get('/', (req, res) => {
    res.send('Please use the POST method on /load')
})
app.post('/cost-estimation', async (req, res) => {
    res.set("Content-Type", "application/json");
    let text = req.body.text;
    let dollarCost = langchainUtil.getRoughEmbeddingCost(text);
    res.send(JSON.stringify({
        dollars: dollarCost
    }))
})
app.post('/embed', async (req, res) => {
    res.set("Content-Type", "application/json");
    let text = req.body.text;
    let {
        digest, dollarCost
    } = await hnswlib.embed({
        text, storeName: "mystore"
    });
    res.send(JSON.stringify({
        message: `Embedded text: ${text.substring(0, 20)}...`,
        digest,
        dollarCost
    }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})