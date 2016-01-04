'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fastStats = require('fast-stats');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// PRIVATE: return frequency of members of an array
function sortByFrequency(array) {
  var frequency = {};

  array.forEach(function (value) {
    frequency[value] = 0;
  });

  var uniques = array.filter(function (value) {
    return ++frequency[value] === 1;
  });

  return uniques.sort(function (a, b) {
    return frequency[b] - frequency[a];
  }).map(function (ball) {
    return [ball, frequency[ball]];
  });
}

// PRIVATE: remove an item from the pool
function removeFromPool(member, pool) {
  var i = pool[0].indexOf(member);
  if (i !== -1) {
    pool[0].splice(i, 1);
    pool[1].splice(i, 1);
  }
  return pool;
}

// PRIVATE: shorthand for ranged random
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// PRIVATE: weighted random
function getWeightedRandomItem(pool) {
  var list = pool[0];
  var weight = pool[1];
  var total_weight = weight.reduce(function (prev, cur, i, arr) {
    return prev + cur;
  });
  var random_num = rand(0, total_weight);
  var weight_sum = 0;
  for (var i = 0; i < list.length; i++) {
    weight_sum += weight[i];
    weight_sum = +weight_sum.toFixed(2);

    if (random_num <= weight_sum) {
      return list[i];
    }
  }
}

// get all powerball winners
function numbers(startDate, endDate) {
  return (0, _nodeFetch2.default)('http://www.powerball.com/powerball/winnums-text.txt').then(function (res) {
    return res.text();
  }).then(function (text) {
    return text.split('\r\n').map(function (line) {
      return line.split('  ');
    });
  }).then(function (lines) {
    return lines.filter(function (line, i, a) {
      return i > 0 && line !== '';
    }).map(function (line) {
      return {
        date: new Date(line[0]).getTime(),
        balls: line.slice(1, 6).map(function (v) {
          return parseInt(v, 10);
        }),
        powerball: parseInt(line[6], 10),
        powerplay: line[7] === '' ? null : parseInt(line[7], 10)
      };
    });
  }).then(function (winners) {
    if (startDate) {
      (function () {
        var start = startDate.getTime();
        winners = winners.filter(function (winner) {
          return winner.date >= start;
        });
      })();
    }
    if (endDate) {
      (function () {
        var end = endDate.getTime();
        winners = winners.filter(function (winner) {
          return winner.date <= end;
        });
      })();
    }
    return winners;
  });
}

// get frequencies of white & red balls
function frequencies(startDate, endDate) {
  return numbers(startDate, endDate).then(function (winners) {
    var balls = [[], []];
    winners.forEach(function (winner) {
      balls[0] = balls[0].concat(winner.balls);
      balls[1].push(winner.powerball);
    });
    return balls;
  }).then(function (balls) {
    return [sortByFrequency(balls[0]), sortByFrequency(balls[1])];
  });
}

// given a frequencies from a ball-spread from above, calculate arithmetic mean of ball-count
function mean(freq) {
  var s1 = new _fastStats.Stats().push(freq.map(function (v) {
    return v[1];
  }));
  return s1.amean().toFixed(4);
}

// given a frequencies from a ball-spread from above, calculate geometric mean of ball-count
function gmean(freq) {
  var s1 = new _fastStats.Stats().push(freq.map(function (v) {
    return v[1];
  }));
  return s1.gmean().toFixed(4);
}

// given a frequencies from a ball-spread from above, calculate median of ball-count
function median(freq) {
  var s1 = new _fastStats.Stats().push(freq.map(function (v) {
    return v[1];
  }));
  return s1.median().toFixed(4);
}

// given a frequencies from a ball-spread from above, calculate range of ball-count
function range(freq) {
  var s1 = new _fastStats.Stats().push(freq.map(function (v) {
    return v[1];
  }));
  return s1.range();
}

// given a frequencies from a ball-spread from above, calculate standard deviation of ball-count
function stddev(freq) {
  var s1 = new _fastStats.Stats().push(freq.map(function (v) {
    return v[1];
  }));
  return s1.stddev().toFixed(4);
}

// predict powerball weighted by the past
function predict(count, startDate, endDate) {
  if (!count) count = 1;
  return frequencies(startDate, endDate).then(function (winners) {
    var out = [];
    var white = [[], []];
    var red = [[], []];
    winners[0].forEach(function (val) {
      white[0].push(val[0]);
      white[1].push(val[1]);
    });
    winners[1].forEach(function (val) {
      red[0].push(val[0]);
      red[1].push(val[1]);
    });

    for (var i = 0; i < count; i++) {
      var innerOut = [];
      for (var j = 0; j < 5; j++) {
        var newWhite = getWeightedRandomItem(white);
        innerOut.push(newWhite);
        white = removeFromPool(newWhite, white);
      }
      var newRed = getWeightedRandomItem(red);
      innerOut.push(newRed);
      red = removeFromPool(newRed, red);
      out.push(innerOut);
    }

    // TODO: check that in each set there are no repeats between red/white dupes

    if (out.length === 1) {
      return out[0];
    }
    return out;
  });
}

var σ = stddev;
var μ = mean;
var powerball = { numbers: numbers, frequencies: frequencies, mean: mean, μ: μ, gmean: gmean, median: median, range: range, stddev: stddev, σ: σ, predict: predict };

exports.default = powerball;
module.exports = exports['default'];

