## Unstructured Webscraper + OpenAI for Energy related Q&A's
### Instructions
Create an .env file on the root of this project.
````bash
echo "OPENAI_API_KEY=<yoursecretkey>" > .env
````
Run the service to parse unstructured data.
````bash
docker run -p 8000:8000 -d --rm --name unstructured-api quay.io/unstructured-io/unstructured-api:latest --port 8000 --host 0.0.0.0
````
then run the ``test/gemeinden.test.js --grep "^hnswlib scans a website and performs a chatGPT query on it \(incl\. PDF's\)$"`` tests sequentially.