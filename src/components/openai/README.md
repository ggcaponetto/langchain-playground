# Instructions

````
export OPENAI_API_KEY=<apikey>
````

````
# List all created fine-tunes
openai api fine_tunes.list
````

```
pip3 install pandas
openai tools fine_tunes.prepare_data -f prepare/prepare-template.jsonl
```

```
openai api fine_tunes.create -t prepare/prepare-template_prepared.jsonl -m ada

openai api fine_tunes.follow -i ft-twwSTLIZFdrWy7HHVR6z3k81

openai api fine_tunes.get -i ft-twwSTLIZFdrWy7HHVR6z3k81
```

```
# Delete a model
openai api models.delete -i <FINE_TUNED_MODEL>
```

Query the fine tuned model
```
curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "prompt": "give me a script to make a cardano nft ->",
    "max_tokens": 50,
    "model": "ada:ft-personal-2023-04-18-13-10-17"
  }'
```

## Pricing

1. 4000 chars === 0.004 mb  === $0.0004
1. 40000000 chars === 4.0 mb  === $4.0
1. 4000000000 chars === 400.0 mb  === $400