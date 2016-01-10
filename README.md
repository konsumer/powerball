# powerball
My attempt at predicting Powerball numbers with nodejs

[![npm version](https://badge.fury.io/js/powerball.svg)](https://badge.fury.io/js/powerball)

See it in action [here](https://tonicdev.com/konsumer/powerball)

## command-line

I included the command `powerball`, if you install with `npm install -g powerball` that will predict numbers.

```
Usage: powerball [options] [numbers]

Options:
  -h, --help       Show help                                           [boolean]
  --count, -c      Count of number sets to return.                 [default: 10]
  --powerplay, -p  For checking: did you enable powerplay?             [boolean]
  --time, -t       What time should the rules be pulled from?
                                           [default: "2016-01-10T23:26:22.323Z"]

Examples:
  powerball -c 5               Get 5 numbersto play
  powerball 01 18 41 43 46 22  See if your numbers got pulled in last draw
```

## Objects

<dl>
<dt><a href="#Statistical">`Statistical`</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Powerball">`Powerball`</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Statistical"></a>
## `Statistical` : <code>object</code>
**Kind**: global namespace  

* [`Statistical`](#Statistical) : <code>object</code>
    * [`.μ(freq)`](#Statistical.μ) ⇒ <code>Number</code>
    * [`.gmean(freq)`](#Statistical.gmean) ⇒ <code>Number</code>
    * [`.median(freq)`](#Statistical.median) ⇒ <code>Number</code>
    * [`.range(freq)`](#Statistical.range) ⇒ <code>Array</code>
    * [`.σ(freq)`](#Statistical.σ) ⇒ <code>Number</code>


-

<a name="Statistical.μ"></a>
### `Statistical.μ(freq)` ⇒ <code>Number</code>
Calculate arithmetic mean of ball-count

**Kind**: static method of <code>[Statistical](#Statistical)</code>  
**Returns**: <code>Number</code> - Arithmatic Mean of weights  

| Param | Type | Description |
| --- | --- | --- |
| freq | <code>Object</code> | A single ball-frequency array from [frequencies](#Powerball.frequencies) |

**Example** *(Get Arithmetic Mean of Red Balls)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.μ(f.red))
```
**Example** *(Get Arithmetic Mean of White Balls)*  
```js
console.log(powerball.mean(f.white))
```

-

<a name="Statistical.gmean"></a>
### `Statistical.gmean(freq)` ⇒ <code>Number</code>
Calculate geometric mean of ball-count

**Kind**: static method of <code>[Statistical](#Statistical)</code>  
**Returns**: <code>Number</code> - Geometric Mean of weights  

| Param | Type | Description |
| --- | --- | --- |
| freq | <code>Object</code> | A single ball-frequency array from [frequencies](#Powerball.frequencies) |

**Example** *(Get Geometric Mean of Red Balls)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.gmean(f.red))
```
**Example** *(Get Geometric Mean of White Balls)*  
```js
console.log(powerball.gmean(f.white))
```

-

<a name="Statistical.median"></a>
### `Statistical.median(freq)` ⇒ <code>Number</code>
Calculate median of ball-count

**Kind**: static method of <code>[Statistical](#Statistical)</code>  
**Returns**: <code>Number</code> - Median of weights  

| Param | Type | Description |
| --- | --- | --- |
| freq | <code>Object</code> | A single ball-frequency array from [frequencies](#Powerball.frequencies) |

**Example** *(Get Median of Red Balls)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.median(f.red))
```
**Example** *(Get Median of White Balls)*  
```js
console.log(powerball.median(f.white))
```

-

<a name="Statistical.range"></a>
### `Statistical.range(freq)` ⇒ <code>Array</code>
Calculate range of ball-count

**Kind**: static method of <code>[Statistical](#Statistical)</code>  
**Returns**: <code>Array</code> - High/low range of numbers for weights.  

| Param | Type | Description |
| --- | --- | --- |
| freq | <code>Object</code> | A single ball-frequency array from [frequencies](#Powerball.frequencies) |

**Example** *(Get Range of Red Balls)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.range(f.red))
```
**Example** *(Get Range of White Balls)*  
```js
console.log(powerball.range(f.white))
```

-

<a name="Statistical.σ"></a>
### `Statistical.σ(freq)` ⇒ <code>Number</code>
Calculate standard deviation of ball-count

**Kind**: static method of <code>[Statistical](#Statistical)</code>  
**Returns**: <code>Number</code> - Standard Deviation of weights  

| Param | Type | Description |
| --- | --- | --- |
| freq | <code>Object</code> | A single ball-frequency array from [frequencies](#Powerball.frequencies) |

**Example** *(Get Standard Deviation of Red Balls)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.stddev(f.red))
```
**Example** *(Get Standard Deviation of White Balls)*  
```js
console.log(powerball.σ(f.white))
```

-

<a name="Powerball"></a>
## `Powerball` : <code>object</code>
**Kind**: global namespace  

* [`Powerball`](#Powerball) : <code>object</code>
    * [`.balls([date])`](#Powerball.balls) ⇒ <code>Array</code>
    * [`.numbers()`](#Powerball.numbers) ⇒ <code>Promise</code>
    * [`.frequencies(winners)`](#Powerball.frequencies) ⇒ <code>Object</code>
    * [`.predict(white, red, [time])`](#Powerball.predict) ⇒ <code>Array</code>
    * [`.payout(pick, winner, powerplay)`](#Powerball.payout) ⇒ <code>Boolean</code> &#124; <code>Number</code>


-

<a name="Powerball.balls"></a>
### `Powerball.balls([date])` ⇒ <code>Array</code>
Get ball-maxes for a given date

**Kind**: static method of <code>[Powerball](#Powerball)</code>  
**Returns**: <code>Array</code> - white, red ball-max  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [date] | <code>Date</code> | <code>now</code> | Date to check |

**Example** *(Current Ball Maxes)*  
```js
// returns [69, 26]
powerball.balls()
```
**Example** *(Old Ball Maxes)*  
```js
// returns [59, 39]
powerball.balls(new Date('1/8/2009'))
```

-

<a name="Powerball.numbers"></a>
### `Powerball.numbers()` ⇒ <code>Promise</code>
Get past winning numbers

**Kind**: static method of <code>[Powerball](#Powerball)</code>  
**Returns**: <code>Promise</code> - Resolves to array of winner objects  
**Example** *(Get Current Numbers)*  
```js
powerball.numbers().then(winners => {
  console.log(winners)
})
```

-

<a name="Powerball.frequencies"></a>
### `Powerball.frequencies(winners)` ⇒ <code>Object</code>
Calculate frequencies of white & red balls

**Kind**: static method of <code>[Powerball](#Powerball)</code>  
**Returns**: <code>Object</code> - keyed with number, value is frequency  

| Param | Type | Description |
| --- | --- | --- |
| winners | <code>Array</code> | The winning numbers from  [numbers](#Powerball.numbers) |

**Example** *(Get Frequency Counts)*  
```js
console.log(powerball.frequencies(winners))
```

-

<a name="Powerball.predict"></a>
### `Powerball.predict(white, red, [time])` ⇒ <code>Array</code>
Predict winning numbers

**Kind**: static method of <code>[Powerball](#Powerball)</code>  
**Returns**: <code>Array</code> - The numbers you should play  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| white | <code>Object</code> |  | White ball-frequency array from [frequencies](#Powerball.frequencies) |
| red | <code>Object</code> |  | Red ball-frequency array from [frequencies](#Powerball.frequencies) |
| [time] | <code>Date</code> | <code>now</code> | Different dates have differnt ball-sets |

**Example** *(Get Prediction)*  
```js
var f = powerball.frequencies(winners)
console.log(powerball.predict(f.white, f.red))
```
**Example** *(Predict For an Old Date)*  
```js
console.log(powerball.predict(f.white, f.red, new Date('1/1/98')))
```

-

<a name="Powerball.payout"></a>
### `Powerball.payout(pick, winner, powerplay)` ⇒ <code>Boolean</code> &#124; <code>Number</code>
Check if your numbers won (only current rules)
[http://www.powerball.com/powerball/pb_prizes.asp](http://www.powerball.com/powerball/pb_prizes.asp)

**Kind**: static method of <code>[Powerball](#Powerball)</code>  
**Returns**: <code>Boolean</code> &#124; <code>Number</code> - true for jackpot, if Number: amount you won  

| Param | Type | Description |
| --- | --- | --- |
| pick | <code>Array</code> | Your number picks (6-length array) |
| winner | <code>Object</code> | A single draw from `number()` |
| powerplay | <code>Boolean</code> | Did you mark power-play on your ticket? |

**Example** *(Check If You Won)*  
```js
powerball.numbers().then(winners => {
  console.log(powerbal.payout([5, 6, 10, 36, 43, 11], winners.pop(), true))
})
```

-

