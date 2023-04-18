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
openai api fine_tunes.create -t prepare/prepare-template_prepared.jsonl -m davinci

openai api fine_tunes.follow -i ft-E16rkQvwVEe7KWI3b7EcEsbe

openai api fine_tunes.get -i ft-E16rkQvwVEe7KWI3b7EcEsbe
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
    "prompt": "can you give me javascript code to make a cardano nft",
    "max_tokens": 50,
    "temperature": 0,
    "model": "davinci:ft-personal-2023-04-18-15-16-00"
  }'
```
```

```

## Fine-Tuning
[https://help.openai.com/en/articles/6811186-how-do-i-format-my-fine-tuning-data](https://help.openai.com/en/articles/6811186-how-do-i-format-my-fine-tuning-data)
```
To fine-tune effectively, you need to format your data properly to provide clues to the model about where to start and stop generating text. 

 

Indicator String 

The indicator string is a symbol or sequence of symbols that you append to the end of your prompt to tell the model that you want it to start generating text after this string. 

 

For example, if you want the model to categorize items as colors, you can use an indicator string like '->'. The prompts in your dataset would look like this:

'banana ->'

'lime ->'

'tomato ->'

 You can use any string as an indicator string as long as it doesn't appear anywhere else in the dataset. We recommend using '\n###\n'.

 

Stop Sequence

The stop sequence is another special symbol or sequence of symbols that you use to tell the model that you want it to stop generating text after that point. 

 

For example, if you want the model to generate one word as a completion, you can use a stop sequence such as "\n" (newline) or "." (period) to mark the end of the completion, like this: 

'prompt' : 'banana ->', 'completion' : ' yellow \n'

'prompt' : 'lime ->', 'completion' : ' green \n'

'prompt' : 'tomato ->', 'completion' : ' red \n'

 

Calling the model

You should use the same symbols used in your dataset when calling the model. If you used the dataset above, you should use '\n' as a stop sequence. You should also append '->' to your prompts as an indicator string (e.g. prompt: 'lemon -> ')

 

It is important that you use consistent and unique symbols for the indicator string and the stop sequence, and that they don't appear anywhere else in your data. Otherwise, the model might get confused and generate unwanted or incorrect text. 

 

Extra Recommendations

We also recommend appending a single space character at the beginning of your outputs. 

 

You can also use our command line tool to help format your dataset, after you have prepared it.


```
## Pricing

1. 4000 chars === 0.004 mb  === $0.0004
1. 40000000 chars === 4.0 mb  === $4.0
1. 4000000000 chars === 400.0 mb  === $400