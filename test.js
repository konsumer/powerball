import {describe, it, before} from 'mocha'
import {assert} from 'chai'
import powerball from './index.js'

describe('numbers', () => {
  it('should be able to grab past winning numbers', () => {
    return powerball.numbers()
      .then((num) => {
        assert(Array.isArray(num), 'is an array')
        assert.isAbove(num.length, 100, 'is more than 100 winners')
      })
      .catch(err => {
        throw err
      })
  })
})

describe('numbersAll', () => {
  it('should be able to grab ', () => {
    return powerball.numbersAll()
      .then((num) => {
        assert(Array.isArray(num), 'is an array')
        assert.isAbove(num.length, 100, 'is more than 100 picks')
      })
      .catch(err => {
        throw err
      })
  })
})

describe('frequency', () => {
  it('should be able to detect frequency of winning numbers', () => {
    return powerball.frequencies()
      .then((freq) => {
        assert(Array.isArray(freq), 'is an array')
        assert.equal(freq.length, 2, 'is white & red balls')
        assert.isAbove(freq[0].length, 20, 'white is more than 20 balls')
        assert.isAbove(freq[1].length, 20, 'red is more than 20 balls')
      })
      .catch(err => {
        throw err
      })
  })

  it('should be able to detect frequency of winning numbers in date-range', () => {
    var startDate = new Date('11/25/2015')
    var endDate = new Date('01/02/2016')
    return powerball.frequencies(startDate, endDate)
      .then((freq) => {
        assert(Array.isArray(freq), 'is an array')
        assert.equal(freq.length, 2, 'is white & red balls')
        assert.equal(freq[0].length, 42, 'white is 42 balls')
        assert.equal(freq[1].length, 10, 'red is 12 balls')
      })
      .catch(err => {
        throw err
      })
  })
})

describe('statistical analysis', () => {
  var freq

  before(() => {
    // using date-range so I can anticipate values
    var startDate = new Date('11/25/2015')
    var endDate = new Date('01/02/2016')
    return powerball.frequencies(startDate, endDate).then((f) => { freq = f })
  })

  it('should be able to calculate arithmatic mean from a date-range', () => {
    assert.equal(powerball.mean(freq[0]), 1.4286, 'calculate average for white balls')
    assert.equal(powerball.μ(freq[1]), 1.2, 'calculate average for red balls')
  })

  it('should be able to calculate geometric mean from a date-range', () => {
    assert.equal(powerball.gmean(freq[0]), 1.3367, 'calculate average for white balls')
    assert.equal(powerball.gmean(freq[1]), 1.1487, 'calculate average for red balls')
  })

  it('should be able to calculate median from a date-range', () => {
    assert.equal(powerball.median(freq[0]), 1, 'calculate median for white balls')
    assert.equal(powerball.median(freq[1]), 1, 'calculate median for red balls')
  })

  it('should be able to calculate value-range from a date-range', () => {
    var r = powerball.range(freq[0])
    assert.equal(r[0], 1, 'calculate bottom of value-range for white balls')
    assert.equal(r[1], 3, 'calculate top of value-range for white balls')

    r = powerball.range(freq[1])
    assert.equal(r[0], 1, 'calculate bottom of value-range for red balls')
    assert.equal(r[1], 2, 'calculate top of value-range for red balls')
  })

  it('should be able to calculate standard deviation from a date-range', () => {
    assert.equal(powerball.stddev(freq[0]), 0.5408, 'calculate average for white balls')
    assert.equal(powerball.σ(freq[1]), 0.4000, 'calculate average for red balls')
  })
})

describe('prediction', () => {
  it('should be able to lay down a reasonable prediction', () => {
    return powerball.predict()
      .then(predictions => {
        assert(Array.isArray(predictions), 'is an array')
        assert.equal(predictions.length, 6, 'prediction length should be 6.')
      })
  })
  it('should be able to lay down a bunch of reasonable predictions', () => {
    return powerball.predict(10)
      .then(predictions => {
        assert(Array.isArray(predictions), 'is an array')
        assert.equal(predictions.length, 10, 'prediction count should be 10.')
        assert.equal(predictions[0].length, 6, 'prediction length should be 6.')
      })
  })
})
