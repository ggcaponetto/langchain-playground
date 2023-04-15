import assert from "assert";
import hnswlib from "../src/components/hnswlib/hnswlib.js";
import fs from "fs";
import path from "path";

describe('hnswlib', function () {
    function isEmpty(path) {
        return fs.readdirSync(path).length === 0;
    }
    describe('#clearStore()', function () {
        it('should remove all the file contents of the storage path', async function () {
            let options = await hnswlib.clearStore()
            const directory = path.resolve(options.path);
            assert.equal(isEmpty(directory), true);
        });
    });
    describe('#createStore()', function () {
        it('should create the storage on storage path', async function () {
            let options = await hnswlib.createStore({
                textArray: ["Hello world", "Bye bye", "hello nice world"],
                metadataArray: [{id: 2}, {id: 1}, {id: 3}]
            })
            const directory = path.resolve(options.path);
            assert.equal(isEmpty(directory), false);
        });
    });
    describe('#loadStore()', function () {
        it('should load the storage from storage path and return a document query result', async function () {
            let loadedVectorStore = await hnswlib.loadStore()
            assert.equal(!!loadedVectorStore, true);
            let res = await hnswlib.queryStore({
                vectorStore: loadedVectorStore
            })
            assert.equal(!!loadedVectorStore, true);
        });
    });
});