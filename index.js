import fetch from 'node-fetch'
import { Stats } from 'fast-stats'
import _ from 'lodash'

/** @namespace Statistical */
/** @namespace Powerball */

/**
 * All possible white/red balls for different datestamps
 * @type {Object}
 * @private
 */
const ballMatrix = {
  0: [45, 45],
  878716800000: [49, 42],
  1034146800000: [43, 42],
  1125471600000: [55, 42],
  1231315200000: [59, 39],
  1326873600000: [59, 35],
  1444201200000: [69, 26],
  8640000000000000: undefined
}

/**
 * Get ball-maxes for a given date
 * @param  {Date} [date=now] Date to check
 * @return {Array}           white, red ball-max
 * @memberof Powerball
 * @example <caption>Current Ball Maxes</caption>
 * ```js// returns [69, 26]
 * powerball.balls()```
 * @example <caption>Old Ball Maxes</caption>
 * ```js// returns [59, 39]
 * powerball.balls(new Date('1/8/2009'))```
 */
function balls (date) {
  date = date || new Date()
  var ts = date.getTime()
  var keys = _.keys(ballMatrix)
  for (var k in keys) {
    if (ts >= keys[k] && ts < keys[ Number(k) + 1 ]) {
      return ballMatrix[ keys[k] ]
    }
  }
}

/**
 * Shorthand for ranged random
 * @param  {Number} min Min possible value
 * @param  {Number} max Max possible value
 * @return {Number}     Value
 * @private
 */
function rand (min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Get a random item from frequency pool, weighted by the number of times drawn
 * @param  {Object} freq   A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Number}        pick
 * @private
 */
function getWeightedRandomItem (freq) {
  var list = _.keys(freq)
  var weight = _.values(freq)
  var total_weight = weight.reduce(function (prev, cur, i, arr) {
    return prev + cur
  })
  var random_num = rand(0, total_weight)
  var weight_sum = 0
  for (var i = 0; i < list.length; i++) {
    weight_sum += weight[i]
    weight_sum = +weight_sum.toFixed(2)
    if (random_num <= weight_sum) {
      return list[i]
    }
  }
}

/**
 * Get past winning numbers
 * @return {Promise}       Resolves to array of winner objects
 * @memberof Powerball
 * @example <caption>Get Current Numbers</caption>
 * powerball.numbers().then(winners => {
 *   console.log(winners)
 * })
 */
function numbers () {
  return fetch('http://www.powerball.com/powerball/winnums-text.txt')
    .then(res => {
      return res.text()
    })
    .then(text => {
      return text.split('\r\n').map(line => {
        return line.split('  ')
      })
    })
    .then(lines => {
      return lines
        .map(line => {
          return {
            date: new Date(line[0]).getTime(),
            white: line.slice(1, 6).map(v => {
              return parseInt(v, 10)
            }),
            red: parseInt(line[6], 10),
            powerplay: line[7] === '' ? 1 : parseInt(line[7], 10)
          }
        })
        .filter((line, i, a) => {
          return line.date
        })
    })
    .then(winners => {
      return winners.sort((a, b) => {
        return a.date - b.date
      })
    })
}

/**
 * Calculate frequencies of white & red balls
 * @param  {Array} winners  The winning numbers from  {@link Powerball.numbers}
 * @return {Object}         keyed with number, value is frequency
 * @memberof Powerball
 * @example <caption>Get Frequency Counts</caption>
 * console.log(powerball.frequencies(winners))
 */
function frequencies (winners) {
  var out = {white: {}, red: {}}
  winners.forEach(winner => {
    winner.white.forEach(white => {
      out.white[white] = out.white[white] ? out.white[white] + 1 : 1
    })
    out.red[winner.red] = out.red[winner.red] ? out.red[winner.red] + 1 : 1
  })
  return out
}

/**
 * Calculate arithmetic mean of ball-count
 * @param  {Object} freq  A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Number}      Arithmatic Mean of weights
 * @memberof Statistical
 * @alias μ
 * @example <caption>Get Arithmetic Mean of Red Balls</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.μ(f.red))
 * @example <caption>Get Arithmetic Mean of White Balls</caption>
 * console.log(powerball.mean(f.white))
 */
function mean (freq) {
  var s1 = new Stats().push(_.values(freq))
  return s1.amean().toFixed()
}

/**
 * Calculate geometric mean of ball-count
 * @param  {Object} freq  A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Number}      Geometric Mean of weights
 * @memberof Statistical
 * @example <caption>Get Geometric Mean of Red Balls</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.gmean(f.red))
 * @example <caption>Get Geometric Mean of White Balls</caption>
 * console.log(powerball.gmean(f.white))
 */
function gmean (freq) {
  var s1 = new Stats().push(_.values(freq))
  return s1.gmean().toFixed()
}

/**
 * Calculate median of ball-count
 * @param  {Object} freq  A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Number}      Median of weights
 * @memberof Statistical
 * @example <caption>Get Median of Red Balls</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.median(f.red))
 * @example <caption>Get Median of White Balls</caption>
 * console.log(powerball.median(f.white))
 */
function median (freq) {
  var s1 = new Stats().push(_.values(freq))
  return s1.median().toFixed()
}

/**
 * Calculate range of ball-count
 * @param  {Object} freq  A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Array}       High/low range of numbers for weights.
 * @memberof Statistical
 * @example <caption>Get Range of Red Balls</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.range(f.red))
 * @example <caption>Get Range of White Balls</caption>
 * console.log(powerball.range(f.white))
 */
function range (freq) {
  var s1 = new Stats().push(_.values(freq))
  return s1.range()
}

/**
 * Calculate standard deviation of ball-count
 * @param  {Object} freq   A single ball-frequency array from {@link Powerball.frequencies}
 * @return {Number}       Standard Deviation of weights
 * @memberof Statistical
 * @alias σ
 * @example <caption>Get Standard Deviation of Red Balls</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.stddev(f.red))
 * @example <caption>Get Standard Deviation of White Balls</caption>
 * console.log(powerball.σ(f.white))
 */
function stddev (freq) {
  var s1 = new Stats().push(_.values(freq))
  return s1.stddev().toFixed()
}

/**
 * Predict winning numbers
 * @param  {Object}  white      White ball-frequency array from {@link Powerball.frequencies}
 * @param  {Object}  red        Red ball-frequency array from {@link Powerball.frequencies}
 * @param  {Date}    [time=now] Different dates have differnt ball-sets
 * @return {Array}              The numbers you should play
 * @memberof Powerball
 * @example <caption>Get Prediction</caption>
 * var f = powerball.frequencies(winners)
 * console.log(powerball.predict(f.white, f.red))
 * @example <caption>Predict For an Old Date</caption>
 * console.log(powerball.predict(f.white, f.red, new Date('1/1/98')))
 */
function predict (white, red, time) {
  time = time || new Date()
  var valid = balls(time)

  // remove invalid numbers
  white = _.omit(white, (val, key) => {
    return Number(key) > valid[0]
  })
  red = _.omit(red, (val, key) => {
    return Number(key) > valid[1]
  })

  var out = []
  for (var i = 0; i < 5; i++) {
    var newWhite = getWeightedRandomItem(white)
    out.push(newWhite)
    delete white[newWhite]
  }
  out.push(getWeightedRandomItem(red))
  return out
}

/**
 * Check if your numbers won (only current rules)
 * {@link http://www.powerball.com/powerball/pb_prizes.asp}
 * @param  {Array}   pick      Your number picks (6-length array)
 * @param  {Object}  winner    A single draw from `number()`
 * @param  {Boolean} powerplay Did you mark power-play on your ticket?
 * @return {Boolean|Number}    true for jackpot, if Number: amount you won
 * @memberof Powerball
 * @example <caption>Check If You Won</caption>
 * powerball.numbers().then(winners => {
 *   console.log(powerbal.payout([5, 6, 10, 36, 43, 11], winners.pop(), true))
 * })
 */
function payout (pick, winner, powerplay) {
  pick = pick.map(Number)
  var out = {white: pick.slice(0, -1), red: pick.pop(), multiply: powerplay ? winner.powerplay : 1}
  out.red_match = (out.red === winner.red)
  out.winning_white = pick.filter(p => {
    return winner.white.indexOf(p) !== -1
  })
  out.pay = 0
  if (!out.red_match) {
    if (out.winning_white.length === 3) {
      out.pay = 7
    } else if (out.winning_white.length === 4) {
      out.pay = 100
    } else if (out.winning_white.length === 5) {
      out.pay = 1000000
    }
  } else {
    if (out.winning_white.length === 1) {
      out.pay = 4
    } else if (out.winning_white.length === 2) {
      out.pay = 7
    } else if (out.winning_white.length === 3) {
      out.pay = 100
    } else if (out.winning_white.length === 4) {
      out.pay = 50000
    } else if (out.winning_white.length === 5) {
      out.pay = 'jackpot'
    }
  }
  out.pay = out.multiply * out.pay
  out.drawn = winner
  return out
}

const σ = stddev
const μ = mean
const powerball = {numbers, frequencies, mean, μ, gmean, median, range, stddev, σ, predict, payout, balls}

export default powerball
