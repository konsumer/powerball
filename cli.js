#!/usr/bin/env node
var powerball = require(__dirname + '/lib.js')

var argv = require('yargs')
  .usage('Usage: $0 [options] [numbers]')

  .default('c', 10)
  .alias('count', 'c')
  .describe('c', 'Count of number sets to return. The pools are limited, so it\'s wise to keep this under 13 or so.')

  .alias('start', 's')
  .describe('s', 'the start-date to look at numbers. Format: DD/MM/YYYY')

  .alias('end', 'e')
  .describe('e', 'the end-date to look at numbers. Format: DD/MM/YYYY')

  .boolean('o')
  .alias('old', 'o')
  .describe('o', 'In October 2015, the pools of numbers changed. This forces the old number-set.')

  .help('h')
  .alias('h', 'help')

  .example('$0 -c 5 -s 10/1/1999', 'Get 5 numbers from 10/1/1999 to now')
  .example('$0 01 18 41 43 46 22', 'See if your numbers got pulled in last draw')

  .argv

var startDate = argv.start ? new Date(argv.start) : null
var endDate = argv.end ? new Date(argv.end) : null

function pad (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

if (argv._.length === 0) {
  powerball.predict(argv.count, startDate, endDate, !argv.old)
    .then(function (predictions) {
      if (argv.count === 1) {
        predictions = [predictions]
      }
      console.log(predictions.map(function (p) {
        p = p.map(function (n) {
          return pad(n, 2)
        })
        var red = p.pop()
        p.sort()
        p.push(red)
        return p.join(' ')
      }).join('\n'))
    })
} else {
  powerball.check(argv._, startDate, endDate, !argv.old)
    .then(function (info) {
      console.log(info)
    })
}
