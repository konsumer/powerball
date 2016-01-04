'use strict';

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('powerball', ['exports', 'node-fetch', 'fast-stats'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('node-fetch'), require('fast-stats'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.nodeFetch, global.fastStats);
    global.powerball = mod.exports;
  }
})(this, function (exports, _nodeFetch, _fastStats) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function sortByFrequency(array) {
    var frequency = {};
    array.forEach(value => {
      frequency[value] = 0;
    });
    var uniques = array.filter(value => {
      return ++frequency[value] === 1;
    });
    return uniques.sort((a, b) => {
      return frequency[b] - frequency[a];
    }).map(ball => {
      return [ball, frequency[ball]];
    });
  }

  function removeFromPool(member, pool) {
    var i = pool[0].indexOf(member);

    if (i !== -1) {
      pool[0].splice(i, 1);
      pool[1].splice(i, 1);
    }

    return pool;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

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

  function numbers(startDate, endDate) {
    return (0, _nodeFetch2.default)('http://www.powerball.com/powerball/winnums-text.txt').then(res => {
      return res.text();
    }).then(text => {
      return text.split('\r\n').map(line => {
        return line.split('  ');
      });
    }).then(lines => {
      return lines.filter((line, i, a) => {
        return i > 0 && line !== '';
      }).map(line => {
        return {
          date: new Date(line[0]).getTime(),
          balls: line.slice(1, 6).map(v => {
            return parseInt(v, 10);
          }),
          powerball: parseInt(line[6], 10),
          powerplay: line[7] === '' ? null : parseInt(line[7], 10)
        };
      });
    }).then(winners => {
      if (startDate) {
        const start = startDate.getTime();
        winners = winners.filter(winner => {
          return winner.date >= start;
        });
      }

      if (endDate) {
        const end = endDate.getTime();
        winners = winners.filter(winner => {
          return winner.date <= end;
        });
      }

      return winners;
    });
  }

  function frequencies(startDate, endDate) {
    return numbers(startDate, endDate).then(winners => {
      var balls = [[], []];
      winners.forEach(winner => {
        balls[0] = balls[0].concat(winner.balls);
        balls[1].push(winner.powerball);
      });
      return balls;
    }).then(balls => {
      return [sortByFrequency(balls[0]), sortByFrequency(balls[1])];
    });
  }

  function mean(freq) {
    var s1 = new _fastStats.Stats().push(freq.map(v => {
      return v[1];
    }));
    return s1.amean().toFixed(4);
  }

  function gmean(freq) {
    var s1 = new _fastStats.Stats().push(freq.map(v => {
      return v[1];
    }));
    return s1.gmean().toFixed(4);
  }

  function median(freq) {
    var s1 = new _fastStats.Stats().push(freq.map(v => {
      return v[1];
    }));
    return s1.median().toFixed(4);
  }

  function range(freq) {
    var s1 = new _fastStats.Stats().push(freq.map(v => {
      return v[1];
    }));
    return s1.range();
  }

  function stddev(freq) {
    var s1 = new _fastStats.Stats().push(freq.map(v => {
      return v[1];
    }));
    return s1.stddev().toFixed(4);
  }

  function predict(count, startDate, endDate) {
    if (!count) count = 1;
    return frequencies(startDate, endDate).then(winners => {
      var out = [];
      var white = [[], []];
      var red = [[], []];
      winners[0].forEach(val => {
        white[0].push(val[0]);
        white[1].push(val[1]);
      });
      winners[1].forEach(val => {
        red[0].push(val[0]);
        red[1].push(val[1]);
      });

      for (let i = 0; i < count; i++) {
        var innerOut = [];

        for (let j = 0; j < 5; j++) {
          var newWhite = getWeightedRandomItem(white);
          innerOut.push(newWhite);
          white = removeFromPool(newWhite, white);
        }

        var newRed = getWeightedRandomItem(red);
        innerOut.push(newRed);
        red = removeFromPool(newRed, red);
        out.push(innerOut);
      }

      if (out.length === 1) {
        return out[0];
      }

      return out;
    });
  }

  const σ = stddev;
  const μ = mean;
  exports.default = { numbers, frequencies, mean, μ, gmean, median, range, stddev, σ, predict };
});
