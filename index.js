import fetch from 'node-fetch'
import {Stats} from 'fast-stats'

// PRIVATE: return frequency of members of an array
function sortByFrequency (array) {
  var frequency = {}

  array.forEach(value => { frequency[value] = 0 })

  var uniques = array.filter(value => {
    return ++frequency[value] === 1
  })

  return uniques.sort((a, b) => {
    return frequency[b] - frequency[a]
  }).map(ball => {
    return [ball, frequency[ball]]
  })
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
  var s1 = new Stats().push(freq.map(v => { return v[1] }))
  return s1.amean().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate geometric mean of ball-count
function gmean (freq) {
  var s1 = new Stats().push(freq.map(v => { return v[1] }))
  return s1.gmean().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate median of ball-count
function median (freq) {
  var s1 = new Stats().push(freq.map(v => { return v[1] }))
  return s1.median().toFixed(4)
}

// given a frequencies from a ball-spread from above, calculate range of ball-count
function range (freq) {
  var s1 = new Stats().push(freq.map(v => { return v[1] }))
  return s1.range()
}

// given a frequencies from a ball-spread from above, calculate standard deviation of ball-count
function stddev (freq) {
  var s1 = new Stats().push(freq.map(v => { return v[1] }))
  return s1.stddev().toFixed(4)
}

const σ = stddev
const μ = mean

export default {numbers, frequencies, mean, μ, gmean, median, range, stddev, σ}
