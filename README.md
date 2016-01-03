# powerball
My attempt at predicting Powerball numbers with nodejs

## usage

My examples are all in ES6.

### numbers()

Get all the Powerball numbers that have won. Optionally, use a date-range. It returns a promise.

```js
import powerball from 'powerball'

powerball.numbers()
    .then((numbers) => {
        console.log(numbers)
    })

// for date-range:
powerball.numbers(new Date('11/25/2015'), new Date('01/02/2016'))
    .then((numbers) => {
        console.log(numbers)
    })
```

### frequencies()

Get the frequencies that numbers occur, Optionally use a date-range. Returns white & red balls seperately, in an array. It returns a promise.

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', freq[0])
        console.log('red balls:', freq[1])
    })

// for date-range:
powerball.frequencies(new Date('11/25/2015'), new Date('01/02/2016'))
    .then((freq) => {
        console.log('white balls:', freq[0])
        console.log('red balls:', freq[1])
    })

```

### statistical analysis

Several statistical analysis methods are included to make rolling your own number-picker easier.

#### mean()

Calculate the arithmatic mean from a list of frequencies.

The arithmetic mean is calculated as the sum of all data points divided by the number of data points.  This is useful for data sets that are fairly uniform, following a linear or binomial distribution.  Use the `amean()` method or the `μ()` method to get at it:

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', powerball.mean(freq[0]))
        console.log('red balls:', powerball.mean(freq[1]))
    })
```

#### gmean()

Calculate the geometric mean from a list of frequencies.

The geometric mean is the `n`th root of the product of all data points where n is the number of data points. This is useful for data sets that follow an exponential or log-normal distribution.  Use the `gmean()` method to get at it:

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', powerball.gmean(freq[0]))
        console.log('red balls:', powerball.gmean(freq[1]))
    })
```

#### median()

Calculate the median from a list of frequencies.

The median is the middle point of the dataset when sorted in ascending order.  This is useful if your dataset has a lot of outliers and noise that would not normally be found in a complete population.  Use the `median()` method to get at it:

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', powerball.median(freq[0]))
        console.log('red balls:', powerball.median(freq[1]))
    })
```

#### range()

Calculate the range of values from a list of frequencies.

The `range()` method tells you the minimum and maximum values of your data set.  It returns an array of two values.  The first is the lower bound and the second is the upper bound.

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', powerball.range(freq[0]))
        console.log('red balls:', powerball.range(freq[1]))
    })
```

#### stddev() or σ()

Calculate the standard deviatation from a list of frequencies.

This tells you the spread of your data if it follows a normal (or close to normal) distribution, ie, the bell curve. Use the `stddev()` method or the `σ()` method to get at it.

```js
powerball.frequencies()
    .then((freq) => {
        console.log('white balls:', powerball.stddev(freq[0]))
        console.log('red balls:', powerball.stddev(freq[1]))
    })
```