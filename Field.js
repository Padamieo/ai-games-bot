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

(function () {

    var Move = require('./Move');

    var Field = function () {

        this.mBoard = [];
        this.mMacroboard = [];
        this.mLastError = '';
        this.mLastX = 0;
        this.mLastY = 0;
        this.ROWS = 9;
        this.COLS = 9;
        this.mAllMicroboardsActive = true;
        this.mActiveMicroboardX = 0;
        this.mActiveMicroboardY = 0;

        this.constructBoard();
        this.constructMacroBoard();
    };


    Field.prototype.constructBoard = function () {

        this.mBoard = new Array(9);

        for (var i = 0; i < 9; i++) {
            this.mBoard[i] = [0,0,0,0,0,0,0,0,0];
        }

    };

    Field.prototype.constructMacroBoard = function () {

        this.mMacroboard = new Array(3);

        for (var i = 0; i < 3; i++) {
            this.mMacroboard[i] = [0,0,0];
        }

    };

    Field.prototype.parseGameData = function (key, value) {

        if (key === 'round') {
            this.mRoundNr = Number(value);
            // console.log(this.mRoundNr);
        }
        if (key === 'move') {
            this.mMoveNr = Number(value);
            // console.log(this.mMoveNr);
        }
        if (key === 'field') {
            this.parseFromString(value);
        }
        if (key === 'macroboard') {
            this.parseMacroboardFromString(value);
        }
    };

    Field.prototype.parseFromString = function (s) {
        //fs.appendFileSync('../../output.txt', s+"\n");

        var s = s.replace(';', ',');
        var r = s.split(',');
        var counter = 0;
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                this.mBoard[x][y] = Number(r[counter]);
                counter++;
            }
        }
        // console.log(this.mBoard);
    };

    Field.prototype.parseMacroboardFromString = function (s) {

        var r = s.split(','),
            counter = 0;

        this.mActiveMicroboardX = -1;
        this.mActiveMicroboardY = -1;
        this.mAllMicroboardsActive = true;

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                this.mMacroboard[x][y] = Number(r[counter]);
                if(this.mMacroboard[x][y] === -1) {
                    this.mActiveMicroboardX = x;
                    this.mActiveMicroboardY = y;
                    this.mAllMicroboardsActive = false;
                }
                counter++;
            }
        }
        // console.log(this.mMacroboard);
    };

    Field.prototype.clearBoard = function () {

        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                this.mBoard[x][y] = 0;
            }
        }
    };

    Field.prototype.getAvailableMoves = function () {
      var fs = require('fs');
      var pkg = require('./package.json');

        var moves = [];

      /*
        if(this.isEmpty()){

          for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
              var macroY = Math.floor(y / 3);
              var macroX = Math.floor(x / 3);
              fs.appendFileSync(pkg.output, macroY+"-"+macroX+"\n");
              if(this.mBoard[x][y] === 0 && this.mMacroboard[macroX][macroY] <= 0) {
                moves.push(new Move(x, y));
              }
            }
          }

        }else{
      */

          if (this.getActiveMicroboardX() === -1) {

            for (var y = 0; y < 3; y++) {
              for (var x = 0; x < 3; x++) {
                var macroY = Math.floor(y / 3);
                var macroX = Math.floor(x / 3);
                fs.appendFileSync(pkg.output, macroY+"-"+macroX+"\n");
                if(this.mBoard[x][y] === 0 && this.mMacroboard[macroX][macroY] <= 0) {
                  moves.push(new Move(x, y));
                }
              }
            }

          } else {

            var startX = this.getActiveMicroboardX() * 3;
            var startY = this.getActiveMicroboardY() * 3;
            for (var y = startY; y < startY + 3; y++) {
              for (var x = startX; x < startX + 3; x++) {
                if (this.mBoard[x][y] === 0) {
                  moves.push(new Move(x, y));
                }
              }
            }
          }
        // }



        return moves;
    };

    Field.prototype.isInActiveMicroboard = function (x, y) {
        if (this.mAllMicroboardsActive) { return true; }
        return (Math.floor(x/3) === this.getActiveMicroboardX() && Math.floor(y/3) === this.getActiveMicroboardY());
    };

    Field.prototype.getActiveMicroboardX = function () {
        if (this.mAllMicroboardsActive) { return -1 };
        return this.mActiveMicroboardX;
    };

    Field.prototype.getActiveMicroboardY = function () {
        if (this.mAllMicroboardsActive) { return -1 };
        return this.mActiveMicroboardY;
    };

    Field.prototype.getLastError = function () {
        return this.mLastError;
    };

    Field.prototype.toString = function () {
        var r = '';
        var counter = 0;
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                if (counter > 0) {
                    r += ',';
                }
                r += this.mBoard[x][y];
                counter++;
            }
        }
        return r;
    };

    Field.prototype.isFull = function () {
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (this.mBoard[x][y] == 0) {
                    // At least one cell is not filled
                    return false;
                }
            }
        }
        // All cells are filled
        return true;
    };

    Field.prototype.isEmpty = function () {
        for (var x = 0; x < this.COLS; x++) {
            for (var y = 0; y < this.ROWS; y++) {
                if (this.mBoard[x][y] > 0) {
                    return false;
                }
            }
        }
        return true;
    };

    Field.prototype.getPlayerId = function (column, row) {
        return this.mBoard[column][row];
    };

    module.exports = Field;

})();
