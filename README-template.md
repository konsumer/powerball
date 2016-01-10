# powerball
My attempt at predicting Powerball numbers with nodejs

[![npm version](https://badge.fury.io/js/powerball.svg)](https://badge.fury.io/js/powerball)

See it in action [here](https://tonicdev.com/konsumer/powerball)

## command-line

I included the command `powerball`, if you install with `npm install -g powerball` that will predict/check numbers.

```
Usage: powerball [options] [numbers]

Options:
  -h, --help       Show help
  --count, -c      Count of number sets to return.              [default: 10]
  --powerplay, -p  For checking: did you enable powerplay?      [boolean]
  --time, -t       What time should the rules be pulled from?   [default: now]

Examples:
  powerball -c 5               Get 5 numbersto play
  powerball 01 18 41 43 46 22  See if your numbers got pulled in last draw
```

{{>main}}