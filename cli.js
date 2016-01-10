#!/usr/bin/env node
var powerball = require(__dirname + '/lib.js')

var argv = require('yargs')
  .usage('Usage: $0 [options] [numbers]')

  .default('c', 10)
  .alias('count', 'c')
  .describe('c', 'Count of number sets to return.')

  .boolean('p')
  .alias('powerplay', 'p')
  .describe('p', 'For checking: did you enable powerplay?')

  .boolean('o')
  .alias('old', 'o')
  .describe('o', 'In October 2015, the pools of numbers changed. This forces the old number-set.')

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

powerball.numbers().then(function (winners) {
  if (argv._.length === 0) {
    var freq = powerball.frequencies(winners)
    for (var i = 0; i < argv.count; i++) {
      console.log(i)
      // console.log(powerball.predict(freq.white, freq.red, !argv.old))
    }
  } else {
    var payout = powerball.payout(argv._, winners.pop(), argv.powerplay)
    console.log('According to the draw on ' + new Date(payout.drawn.date) + ' (' + payout.drawn.white.join(' ') + ' ' + payout.drawn.red + ' - ' + payout.drawn.powerplay + 'x )')
    console.log('You have ' + payout.winning_white.length + ' matching white numbers and ' + (payout.red_match ? 1 : 0) + ' red matches. You should get paid $' + payout.pay + '.')
  }
})
