import fetch from 'node-fetch'
import { Stats } from 'fast-stats'

// PRIVATE: return frequency of members of an array, sorted by number pulled
function sortByFrequency (array) {
  var frequency = {}

  array.forEach(value => {
    frequency[value] = 0
  })

  var uniques = array.filter(value => {
    return ++frequency[value] === 1
  })

  return uniques.sort((a, b) => {
    return frequency[b] - frequency[a]
  }).map(ball => {
    return [ball, frequency[ball]]
  })
}

// PRIVATE: remove an item from the frequency pool of winners
function removeFromPool (member, pool) {
  var i = pool[0].indexOf(member)
  if (i !== -1) {
    pool[0].splice(i, 1)
    pool[1].splice(i, 1)
  }
  return pool
}

// PRIVATE: given a frequency pool of winners and a max for possible numbers, add any that are un-accounted for with a weight of 1
function addRemaining (pool, max) {
  for (let i = 1; i <= max; i++) {
    var found = pool[0].indexOf(i)
    if (found === -1) {
      pool[0].push(i)
      pool[1].push(0)
    } else {
      pool[1][found] = pool[1][found] + 1
    }
  }
  return pool
}

// PRIVATE: weighted random
function getWeightedRandomItem (pool) {
  var list = pool[0]
  var weight = pool[1]
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
 * Get winning numbers
 * @return {Promise}       Resolves to array of winner objects
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
 * @param  {Array} winners  The winning numbers from  `numbers()`
 * @return {Array}          Array of white & red array of numbers & draw-weight
 */
function frequencies (winners) {
  var white = []
  var red = []
  winners.forEach(winner => {
    white = white.concat(winner.white)
    red.push(winner.red)
  })
  return {white: sortByFrequency(white), red: sortByFrequency(red)}
}

/**
 * Calculate arithmetic mean of ball-count
 * @param  {Array} freq  A single ball-frequency array from `frequency()`
 * @return {Number}      Arithmatic Mean
 */
function mean (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.amean().toFixed(4)
}

/**
 * Calculate geometric mean of ball-count
 * @param  {Array} freq  A single ball-frequency array from `frequency()`
 * @return {Number}      Geometric Mean
 */
function gmean (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.gmean().toFixed(4)
}

/**
 * Calculate median of ball-count
 * @param  {Array} freq  A single ball-frequency array from `frequency()`
 * @return {Number}      Median
 */
function median (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.median().toFixed(4)
}

/**
 * Calculate range of ball-count
 * @param  {Array} freq  A single ball-frequency array from `frequency()`
 * @return {Array}       High/low range of numbers for value.
 */
function range (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.range()
}

/**
 * Calculate standard deviation of ball-count
 * @param  {Array} freq   A single ball-frequency array from `frequency()`
 * @return {Number}       Standard Deviation
 */
function stddev (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.stddev().toFixed(4)
}

/**
 * Predict winning numbers
 * @param  {Array}   white     White ball-frequency array from `frequency()`
 * @param  {Array}   red       Red ball-frequency array from `frequency()`
 * @param  {Boolean} newRules  Does it use the new (Oct 2015) rules or not?
 * @return {Array}             The numbers you should play
 */
function predict (white, red, newRules) {
  newRules = newRules === undefined ? true : newRules
  red = addRemaining(red, newRules ? 26 : 35)
  white = addRemaining(white, newRules ? 69 : 59)
  var out = []
  for (let j = 0; j < 5; j++) {
    var newWhite = getWeightedRandomItem(white)
    out.push(newWhite)
    white = removeFromPool(newWhite, white)
  }
  out.sort((a, b) => { return a - b })
  out.push(getWeightedRandomItem(red))
  return out
}

/**
 * Check if your numbers won
 * http://www.powerball.com/powerball/pb_prizes.asp
 * @param  {Array}   pick      Your number picks (6-length array)
 * @param  {Object}  winner    A single draw from `number()`
 * @param  {Boolean} powerplay Did you mark power-play on your ticket?
 * @return {Mixed}             true for jackpot, if Number: amount you won
 */
function payout (pick, winner, powerplay) {
  pick = pick.map(Number)
  var out = {white: pick.slice(0, -1), red: pick.pop(), multiply: powerplay ? winner.powerplay : 1}
  out.red_match = (out.red === winner.red)
  out.winning_white = pick.filter(p => {
    return winner.white.indexOf(p) !== -1
  })
  out.pay = 0
  if (!out.redMatch) {
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
  out.drawn = winner
  out.pay = out.multiply * out.pay
  return out
}

const σ = stddev
const μ = mean
const powerball = {numbers, frequencies, mean, μ, gmean, median, range, stddev, σ, predict, payout}

export default powerball
