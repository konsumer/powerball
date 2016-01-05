import fetch from 'node-fetch'
import { Stats } from 'fast-stats'

// PRIVATE: return frequency of members of an array
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
function addRemaining(pool, max){
  var i = 0
  var all = new Array(max).map(() => {
    return i++
  })
  all.forEach(v => {
    if (pool[0].indexOf(v) === -1){
      pool[0].push(v)
      pool[1].push(1)
    }
  })
  return pool
}

// PRIVATE: shorthand for ranged random
function rand (min, max) {
  return Math.random() * (max - min) + min
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

// get all powerball winners
function numbers (startDate, endDate) {
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
        .filter((line, i, a) => {
          return i > 0 && line !== ''
        })
        .map(line => {
          return {
            date: new Date(line[0]).getTime(),
            balls: line.slice(1, 6).map(v => {
              return parseInt(v, 10)
            }),
            powerball: parseInt(line[6], 10),
            powerplay: line[7] === '' ? null : parseInt(line[7], 10)
          }
        })
    })
    .then(winners => {
      if (startDate) {
        const start = startDate.getTime()
        winners = winners.filter(winner => {
          return winner.date >= start
        })
      }
      if (endDate) {
        const end = endDate.getTime()
        winners = winners.filter(winner => {
          return winner.date <= end
        })
      }
      return winners
    })
}

// get frequencies of white & red balls
function frequencies (startDate, endDate) {
  return numbers(startDate, endDate)
    .then(winners => {
      var balls = [[], []]
      winners.forEach(winner => {
        balls[0] = balls[0].concat(winner.balls)
        balls[1].push(winner.powerball)
      })
      return balls
    })
    .then(balls => {
      return [sortByFrequency(balls[0]), sortByFrequency(balls[1])]
    })
}

// given a frequencies from a ball-spread from above, calculate arithmetic mean of ball-count
function mean (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.amean().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate geometric mean of ball-count
function gmean (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.gmean().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate median of ball-count
function median (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.median().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate range of ball-count
function range (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.range()
}

// given a frequencies from a ball-spread from above, calculate standard deviation of ball-count
function stddev (freq) {
  var s1 = new Stats().push(freq.map(v => {
    return v[1]
  }))
  return s1.stddev().toFixed(4)
}

// predict powerball weighted by the past
function predict (count, startDate, endDate, newRules) {
  if (!count) count = 1
  if (newRules === null) {
    newRules = true
  }
  return frequencies(startDate, endDate)
    .then(winners => {
      var out = []
      var white = [[], []]
      var red = [[], []]
      winners[0].forEach(val => {
        if (!newRules || (val[0] > 0 && val[0] < 70)) {
          white[0].push(val[0])
          white[1].push(val[1] + 1)
        }
      })
      winners[1].forEach(val => {
        if (!newRules || (val[0] > 0 && val[0] < 27)) {
          red[0].push(val[0])
          red[1].push(val[1] + 1)
        }
      })   

      red = addRemaining(red, newRules ? 26 : 35)
      white = addRemaining(white, newRules ? 69 : 59)

      for (let i = 0; i < count; i++) {
        var innerOut = []
        for (let j = 0; j < 5; j++) {
          var newWhite = getWeightedRandomItem(white)
          innerOut.push(newWhite)
          white = removeFromPool(newWhite, white)
        }
        var newRed = getWeightedRandomItem(red)
        innerOut.push(newRed)
        red = removeFromPool(newRed, red)
        out.push(innerOut)
      }

      // TODO: check that in each set there are no repeats between red/white dupes

      if (out.length === 1) {
        return out[0]
      }
      return out
    })
}

const σ = stddev
const μ = mean
const powerball = {numbers, frequencies, mean, μ, gmean, median, range, stddev, σ, predict}

export default powerball

