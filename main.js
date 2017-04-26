// Copyright 2016 TheAIGames.com

//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at

//        http://www.apache.org/licenses/LICENSE-2.0

//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

var fs = require('fs');
var pkg = require('./package.json');

var bot,
    Bot,
    readline = require('readline'),
    Move = require('./Move'),
    Field = require('./Field');
/**
 * Main class
 * Initializes a map instance and an empty settings object
 */
Bot = function () {

  if(pkg.debug){
    fs.appendFile(pkg.output, 'start\n', function (err) {
      if (err) throw err;
    });
  }

  if (false === (this instanceof Bot)) {
    return new Bot();
  }

  // initialize options object
  this.options = {};

  this.field = new Field();

};

/**
 *
 */
Bot.prototype.run = function () {

    var io = readline.createInterface(process.stdin, process.stdout);

    io.on('line', function (data) {
      var line,
          lines,
          lineParts,
          command,
          response;

      // stop if line doesn't contain anything
      if (data.length === 0) {
        return;
      }

      lines = data.trim().split('\n');

      while (0 < lines.length) {

        line = lines.shift().trim();
        lineParts = line.split(" ")

        // stop if lineParts doesn't contain anything
        if (lineParts.length === 0) {
          return;
        }

        // get the input command and convert to camel case
        command = lineParts.shift().toCamelCase();

        // invoke command if function exists and pass the data along
        // then return response if exists
        if (command in bot) {
          response = bot[command](lineParts);

          if (response && 0 < response.length) {
            process.stdout.write(response + '\n');
          }
        } else {
          process.stderr.write('Unable to execute command: ' + command + ', with data: ' + lineParts + '\n');
        }
      }
    });

    io.on('close', function () {
      process.exit(0);
    });
};

/**
 * Respond to settings command
 * @param Array data
 */
Bot.prototype.settings = function (data) {
  var key = data[0], value = data[1];
  // set key to value
  this.options[key] = value;
};

Bot.prototype.action = function (data) {

  if (data[0] === 'move') {
    var botId = this.options['your_botid'];
    var moves = this.field.getAvailableMoves( botId );

    var move = moves[Math.floor(Math.random() * moves.length)];

    var action = "place_move " + move.x + ' ' + move.y;

    if(pkg.debug){
      var currentBoard = this.field.board;
      var breakdown = currentBoard.toString().split(/(.{18})/);

      for (i = 0; i < breakdown.length; i++) {
        var out = breakdown[i].toString();
        if(out.length > 0){
          Print(out+"\n");
        }
      }
    }

    Print("---"+JSON.stringify(moves)+"\n");
    Print(JSON.stringify(move)+"SUBMIT\n\n");

    return action;
  }

};

Bot.prototype.update = function (data) {

    if (data[0] === 'game') {
      this.field.parseGameData(data[1], data[2]);
    }
};

String.prototype.toCamelCase = function () {
  return this.replace('/', '_').replace(/_[a-z]/g, function (match) {
    return match.toUpperCase().replace('_', '');
  });
};

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

/**
 * Initialize bot
 * __main__
 */
bot = new Bot();
bot.run();
