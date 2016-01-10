#!/usr/bin/env node
var moment = require('moment')

var powerball = require(__dirname + '/lib.js')

var now = new Date()

var argv = require('yargs')
  .usage('Usage: $0 [options] [numbers]')

  .default('c', 10)
  .alias('count', 'c')
  .describe('c', 'Count of number sets to return.')

  .boolean('p')
  .alias('powerplay', 'p')
  .describe('p', 'For checking: did you enable powerplay?')

  .default('t', now)
  .alias('time', 't')
  .describe('t', 'What time should the rules be pulled from?')

  .help('h')
  .alias('h', 'help')

  .example('$0 -c 5', 'Get 5 numbersto play')
  .example('$0 01 18 41 43 46 22', 'See if your numbers got pulled in last draw')

  .argv

function pad (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

powerball.numbers()
  .then(function (winners) {
    if (argv._.length === 0) {
      var freq = powerball.frequencies(winners)
      for (var i = 0; i < argv.count; i++) {
        var predictions = powerball.predict(freq.white, freq.red, argv.time).map(function (n) { return pad(n, 2) })
        var red = predictions.pop()
        predictions.sort()
        console.log(predictions.join(' ') + ' ' + red)
      }
    } else {
      var winner = winners.pop()
      // TODO: use argv.time to find the right winner for any time, find payout rules for that
      var payout = powerball.payout(argv._, winner, argv.powerplay)
      var d = moment(payout.drawn.date)
      console.log('According to the draw on ' + d.format('dddd, MMM Do, YYYY') + ' ( ' + payout.drawn.white.join(' ') + ' ' + payout.drawn.red + ' - ' + payout.drawn.powerplay + 'x )')
      console.log('You have ' + payout.winning_white.length + ' matching white numbers and ' + (payout.red_match ? 1 : 0) + ' red matches. You should get paid $' + payout.pay + '.')
    }
  })
  .catch(function (err) { throw err })
