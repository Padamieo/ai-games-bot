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
    var fs = require('fs');
    var pkg = require('./package.json');

    var Field = function () {

        this.board = [];
        this.macroBoard = [];
        this.mLastError = '';
        this.mLastX = 0;
        this.mLastY = 0;
        this.ROWS = 9;
        this.COLS = 9;
        this.mAllMicroboardsActive = true;
        this.mActiveMicroboardX = 0;
        this.mActiveMicroboardY = 0;

        this.constructBoard();
        this.constructMacroBoard('macroBoard');

        this.risk = [];
        this.constructMacroBoard('risk');

        this.info = [];
        this.constructMacroBoard('info');
    };


    Field.prototype.constructBoard = function () {
      this.board = new Array(9);
      for (var i = 0; i < 9; i++) {
        this.board[i] = [0,0,0,0,0,0,0,0,0];
      }
    };

    Field.prototype.constructMacroBoard = function (term) {
      this[term] = new Array(3);
      for (var i = 0; i < 3; i++) {
        this[term][i] = [0,0,0];
      }
    };

    Field.prototype.printMicro = function( value ){
      var batch = value.split(',');
      var count = 0;
      for (var i = 0; i < batch.length; i++) {
        var newline = (count === 2 ? "\n" : '' );
        fs.appendFileSync(pkg.output, batch[i]+","+newline);
        var count = ( newline === "\n" ? 0 : count+1 );
      }
      fs.appendFileSync(pkg.output, "---\n");
    };

    Field.prototype.parseGameData = function (key, value) {

        if (key === 'round') {
          this.mRoundNr = Number(value);
        }
        if (key === 'move') {
          this.mMoveNr = Number(value);
        }
        if (key === 'field') {
          this.parseFromString(value);
        }
        if (key === 'macroboard') {

          //this.printMicro(value);

          this.parseMacroboardFromString(value);
        }
    };

    Field.prototype.parseFromString = function (s) {

      var s = s.replace(';', ',');
      var r = s.split(',');
      var counter = 0;
      for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
          this.board[x][y] = Number(r[counter]);
          counter++;
        }
      }

    };

    Field.prototype.parseMacroboardFromString = function (s) {

        var r = s.split(','), counter = 0;

        this.mActiveMicroboardX = -1;
        this.mActiveMicroboardY = -1;
        this.mAllMicroboardsActive = true;

        for (var y = 0; y < 3; y++) {
          for (var x = 0; x < 3; x++) {
            this.macroBoard[x][y] = Number(r[counter]);
            if(this.macroBoard[x][y] === -1) {

              this.mActiveMicroboardX = x;
              this.mActiveMicroboardY = y;
              this.mAllMicroboardsActive = false;
            }
            counter++;
          }
        }

    };

    Field.prototype.clearBoard = function () {
      for (var x = 0; x < 9; x++) {
        for (var y = 0; y < 9; y++) {
          this.board[x][y] = 0;
        }
      }
    };



    Field.prototype.getAvailableMoves = function ( botId ) {

      var moves = [];

      if(this.isEmpty()){
        var preferance = [[0,0],[0,8],[8,0],[8,8],[4,4]];
        for (var i = 0; i < preferance.length; i++) {
          moves.push(new Move(preferance[i][0], preferance[i][1]));
        }
        return moves;
      }

      if (this.getActiveMicroboardX() === -1) {

      /*
        for (var y = 0; y < 3; y++) {
          for (var x = 0; x < 3; x++) {
            var macroY = Math.floor(y / 3);
            var macroX = Math.floor(x / 3);
            fs.appendFileSync(pkg.output, macroY+"-"+macroX+"\n");
            if(this.board[x][y] === 0 && this.macroBoard[macroX][macroY] <= 0) {
              moves.push(new Move(x, y));
            }
          }
        }
      */

      } else {

        var macroX = this.getActiveMicroboardX();
        var macroY = this.getActiveMicroboardY();
        var startX = macroX * 3;
        var startY = macroY * 3;

        info = this.microInfo(macroX, macroY);

        for (var y = startY; y < startY + 3; y++) {
          for (var x = startX; x < startX + 3; x++) {
            if (this.board[x][y] === 0) {
              moves.push(new Move(x, y));
            }
          }
        }

        if(moves.length === 9){
          for (var i = moves.length - 1; i >= 0; i--) {
            if(!(i % 2 === 0)){
              moves.splice(i, 1);
            }
          }
        }

        var enemyId = this.enemyId(botId);

        if(info[botId] === 1 && info[enemyId] === 0){

          fs.appendFileSync(pkg.output, "@@"+JSON.stringify(info)+"\n");
          //fs.appendFileSync(pkg.output, "@@\n");
        }

        if(info[botId] === 2){

          fs.appendFileSync(pkg.output, "##"+JSON.stringify(info)+"\n");
          //fs.appendFileSync(pkg.output, "@@\n");
        }


      }

      return moves;
    };

    Field.prototype.enemyId = function ( botId ) {
      return (botId === 2 ? 1 : 2);
    };

    Field.prototype.microInfo = function (macroX, macroY) {
      if(this.info[macroX][macroY] === 0){
        info = { 1:0, 2:0 };
      }else{
        info = { 1:0, 2:0 }; //this.info[macroX][macroY];
      }

      //fs.appendFileSync(pkg.output, "@@"+JSON.stringify(this.info)+"\n");

      // var contents = [];

      var startX = macroX * 3;
      var startY = macroY * 3;

      for (var y = startY; y < startY + 3; y++) {
        for (var x = startX; x < startX + 3; x++) {
          if (this.board[x][y] === 1) {
            info[1] = info[1]+1;
          }else if (this.board[x][y] === 2) {
            info[2] = info[2]+1;
          }
          //contents.push(this.board[x][y]);
        }
      }

      this.info[macroX][macroY] = info;

      // a = this.aa(a);
      //
      // var result = [];
      // var merged = [];
      // contents.forEach(function (element, index) {
      //     var group = index % 3;
      //     var temp = result[group];
      //
      //     if (!Array.isArray(temp)) {
      //         temp = [];
      //     }
      //
      //     temp.push(element);
      //     result[group] = temp;
      //     merged = [].concat.apply([], result);
      // });
      //
      // fs.appendFileSync(pkg.output, "@@@@@\n");
      // var count = 0;
      // for (var i = 0; i < merged.length; i++) {
      //   var newline = (count === 2 ? "\n" : '' );
      //   fs.appendFileSync(pkg.output, merged[i]+","+newline);
      //   var count = ( newline === "\n" ? 0 : count+1 );
      // }
      // fs.appendFileSync(pkg.output, "@@@@@\n");
      //
      // fs.appendFileSync(pkg.output, "@"+JSON.stringify(a)+"\n");
      return info;
    };

    Field.prototype.boardEmpty = function () {
      var startX = this.getActiveMicroboardX() * 3;
      var startY = this.getActiveMicroboardY() * 3;
      for (var y = startY; y < startY + 3; y++) {
        for (var x = startX; x < startX + 3; x++) {
          if (this.board[x][y] > 0) {
            return false;
          }
        }
      }
      return true;
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
                r += this.board[x][y];
                counter++;
            }
        }
        return r;
    };

    Field.prototype.isFull = function () {
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (this.board[x][y] == 0) {
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
          if (this.board[x][y] > 0) {
            return false;
          }
        }
      }
      return true;
    };

    // Field.prototype.getPlayerId = function (column, row) {
    //   return this.board[column][row];
    // };

    module.exports = Field;

})();
