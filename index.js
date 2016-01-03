import fetch from 'node-fetch'

// return frequency of members of an array
function sortByFrequency (array) {
  var frequency = {}

  array.forEach(value => { frequency[value] = 0 })

  var uniques = array.filter(value => {
    return ++frequency[value] === 1
  })

  return uniques.sort((a, b) => {
    return frequency[b] - frequency[a]
  }).map(ball => {
    return {ball: ball, frequency: frequency[ball]}
  })
}

// get all powerball winners
export const numbers = (startDate, endDate) => {
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
          return i > 0 && i < (a.length - 1)
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
export const frequencies = () => {
  return numbers()
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
