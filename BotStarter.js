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
/*
fs.writeFile("./test", "Hey there!", function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
});
*/

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
    var key = data[0],
        value = data[1];

    // set key to value
    this.options[key] = value;
};

Bot.prototype.action = function (data) {

  /*
  fs.writeFile("./test", data, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
  */

    if (data[0] === 'move') {

        var moves = this.field.getAvailableMoves();

        //process.stderr.write(moves);

        var move = moves[Math.floor(Math.random() * moves.length)];

        return "place_move " + move.x + ' ' + move.y;
    }
};

Bot.prototype.update = function (data) {

    // process.stderr.write(data);
    if (data[0] === 'game') {
        this.field.parseGameData(data[1], data[2]);
    }
};

String.prototype.toCamelCase = function () {

    return this.replace('/', '_').replace(/_[a-z]/g, function (match) {
        return match.toUpperCase().replace('_', '');
    });
};

/**
 * Initialize bot
 * __main__
 */
bot = new Bot();
bot.run();
