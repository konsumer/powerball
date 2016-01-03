import {describe, it} from 'mocha'
import {assert} from 'chai'
import {numbers, frequencies} from './index.js'

describe('lottery_predict', () => {
  it('should be able to grab past winning numbers', () => {
    return numbers()
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
    return numbers(startDate, endDate)
      .then((num) => {
        assert(Array.isArray(num), 'is an array')
        assert.equal(num.length, 12, 'is 12 winners')
      })
      .catch(err => {
        throw err
      })
  })

  it('should be able to detect frequency', () => {
    return frequencies()
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
})
