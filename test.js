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

  it('should be able to grab past winning numbers in date-range', () => {
    var startDate = new Date('11/25/2015')
    var endDate = new Date('01/02/2016')
    return powerball.numbers(startDate, endDate)
      .then((num) => {
        assert(Array.isArray(num), 'is an array')
        assert.equal(num.length, 12, 'is 12 winners')
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
    assert.equal(powerball.mean(freq[1]), 1.2, 'calculate average for red balls')
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
