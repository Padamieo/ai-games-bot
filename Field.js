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
    var Print = require('./Print');

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
        Print(batch[i]+","+newline);
        var count = ( newline === "\n" ? 0 : count+1 );
      }
      Print("---\n");
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

    Field.prototype.buildArrayLengths = function( array ){
      var arrayLengths = [];
      for (var i = 0; i < array.length; i++) {
        arrayLengths.push(array[i].length);
      }
      return arrayLengths;
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
            Print(macroY+"-"+macroX+"\n");
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

        var loc = [];
        var enemyloc = [];
        var botId = parseInt(botId, 10);
        var enemyId = parseInt(this.enemyId(botId), 10);

        //var info = this.microInfo(macroX, macroY);

        for (var y = startY; y < startY + 3; y++) {
          for (var x = startX; x < startX + 3; x++) {
            var v = parseInt(this.board[x][y], 10);
            if (v === 0) {
              moves.push(new Move(x, y));
            }
            if (v === botId) {
              loc.push(new Move(x, y));
            }
            if (v === enemyId) {
              enemyloc.push(new Move(x, y));
            }
          }
        }

        Print("L"+startX+","+startY+"\n");

        if(moves.length === 9){
          //need to assess larger picture with risk
          Print("ANY\n");
          //moves = removeNoIdeals( moves );
        }

        Print("num:"+loc.length+"\n");

        if( loc.length === 0 ){

          Print("no placement yet\n");
          if(enemyloc.length === 1){
            Print("single enemy placement\n");
            //do we just place in center if its avaliable

            var center = [{"x":startX+1,"y":startY+1}];
            // Print(JSON.stringify(enemyloc)+"\n");
            // Print(JSON.stringify(center)+"\n");
            if( JSON.stringify(enemyloc) != JSON.stringify(center) ){
              moves = center;
              Print("SINGLE\n");
            }

          }else if( enemyloc.length >= 2 ){
            Print("2 or more enemy placements\n");
            if( enemyloc.length === 2 ){
              Print("2 placements\n");
              var tempProcess = this.processMicro( enemyloc, startX, startY, enemyId, botId  );
              Print("output:"+JSON.stringify(tempProcess)+"\n");
            }
          }else{
            Print("no enemy placement\n");
            // may want to force emeny to place in no ideals,
            // where as this will allow them to place in ideals
            // moves = removeNoIdeals( moves );
          }

        }else{

          if(loc.length > 1 ){
            //Print("enemy:"+info[botId]+"\n");
            //Print("enemy:"+info[enemyId]+"\n");
            Print("loc:"+JSON.stringify(loc)+"\n");

            var tempProcess = this.processMicro( loc, startX, startY, botId, enemyId  );
            var a = tempProcess.a;
            var b = tempProcess.b;
            var c = tempProcess.c;
            var v = tempProcess.v;

            var out = [];

            //
            var tempC = this.basicFindPatterns( c, out );
            var z = tempC.pattern;
            var cArr = tempC.lengths;
            out = tempC.out;

            //
            var tempA = this.basicFindPatterns( a, out );
            var e = tempA.pattern;
            var aArr = tempA.lengths;
            out = tempA.out;

            //
            var tempB = this.basicFindPatterns( b, out );
            var g = tempB.pattern;
            var bArr = tempB.lengths;
            out = tempB.out;

            //
            var tempV = this.basicFindPatterns( v, out );
            var f = tempV.pattern;
            var vArr = tempV.lengths;
            out = tempV.out;

            if( z === true || g === true || e === true || f === true ){

              Print("WIN WITH SINGLE\n");
              Print("WIN:"+JSON.stringify(out)+"\n");
              moves = out;

            }else{

              Print("fallback\n");
              Print("WIN:"+JSON.stringify(c)+"\n");
              Print("WIN:"+JSON.stringify(a)+"\n");
              Print("WIN:"+JSON.stringify(b)+"\n");
              Print("WIN:"+JSON.stringify(v)+"\n");

              buildgoodmoves = [];
              for(var i = 0; i < bArr.length; i++){
                for(var x = 0; x < b[i].length; x++){
                  buildgoodmoves.push(b[i][x]);
                }
              };

              for(var i = 0; i < aArr.length; i++){
                for(var x = 0; x < a[i].length; x++){
                  buildgoodmoves.push(a[i][x]);
                }
              };

              for(var i = 0; i < cArr.length; i++){
                for(var x = 0; x < c[i].length; x++){
                  buildgoodmoves.push(c[i][x]);
                }
              };

              for(var i = 0; i < vArr.length; i++){
                for(var x = 0; x < v[i].length; x++){
                  buildgoodmoves.push(v[i][x]);
                }
              };

              Print("b:"+JSON.stringify(buildgoodmoves)+"\n");
              if(buildgoodmoves.length >= 1 ){
                moves = buildgoodmoves;
              }

            }


          }

        }

      }

      return moves;
    };

    Field.prototype.basicFindPatterns = function( data, current_pass ){
      var array_of_length = this.buildArrayLengths( data );
      //var sumE = aArr.reduce((a, b) => a + b, 0);
      var pattern = array_of_length.includes( 1, 1 );
      if( pattern ){
        for(var i = 0; i < array_of_length.length; i++ ){
          if( array_of_length[i] === 1 ){
            current_pass.push( data[i][0] );
          }
        }
      }
      return {
        pattern: pattern,
        lengths: array_of_length,
        out: current_pass
      };
    };

    Field.prototype.processMicro = function( loc, startX, startY, botId, enemyId ){
      var a = [];
      var b = [];
      var c = [];
      var v = [];
      for (var i = 0; i < loc.length; i++) {

        xRow = loc[i].x;
        yRow = loc[i].y;

        c.push(this.diagonall( true, xRow, yRow, startX, startY, enemyId ));

        v.push(this.diagonall( false, xRow, yRow, startX, startY, enemyId ));

        var positionX = this.possible( xRow, startX );
        a.push(this.viable( positionX, yRow, botId, true ));

        var positionY = this.possible( yRow, startY );
        b.push(this.viable( positionY, xRow, botId, false ));

      }
      return {
        a: a,
        b: b,
        c: c,
        v: v
      };
    };

    // not sure this is ideal, chooses x positions
    Field.prototype.removeNoIdeals = function( moves ){
      if(moves.length === 9){
        for (var i = moves.length - 1; i >= 0; i--) {
          if(!(i % 2 === 0)){
            moves.splice(i, 1);
          }
        }
      }
      return moves;
    };

    Field.prototype.diagonall = function( sw, xrow, yrow, startx, starty, enemyId ){
      otherPos = [];
      count = 0;

      if(sw){

        if( (xrow === startx) && (yrow === starty) ){

          if(this.board[startx+1][starty+1] === 0){
            otherPos.push(new Move(startx+1, starty+1));
          }else if(this.board[startx+1][starty+1] === enemyId){
            count++;
          }

          if(this.board[startx+2][starty+2] === 0){
            otherPos.push(new Move(startx+2, starty+2));
          }else if(this.board[startx+2][starty+2] === enemyId){
            count++;
          }
        }

        if( (xrow === startx+1) && (yrow === starty+1) ){

          if(this.board[startx][starty] === 0){
            otherPos.push(new Move(startx, starty));
          }else if(this.board[startx][starty] === enemyId){
            count++;
          }

          if(this.board[startx+2][starty+2] === 0){
            otherPos.push(new Move(startx+2, starty+2));
          }else if(this.board[startx+2][starty+2] === enemyId){
            count++;
          }
        }

        if( (xrow === startx+2) && (yrow === starty+2) ){

          if(this.board[startx+1][starty+1] === 0){
            otherPos.push(new Move(startx+1, starty+1));
          }else if(this.board[startx+1][starty+1] === enemyId){
            count++;
          }

          if(this.board[startx][starty] === 0){
            otherPos.push(new Move(startx, starty));
          }else if(this.board[startx][starty] === enemyId){
            count++;
          }
        }

      }else{

        if( (xrow === startx+2) && (yrow === starty) ){

          if(this.board[startx+1][starty+1] === 0){
            otherPos.push(new Move(startx+1, starty+1));
          }else if(this.board[startx+1][starty+1] === enemyId){
            count++;
          }

          if(this.board[startx][starty+2] === 0){
            otherPos.push(new Move(startx, starty+2));
          }else if(this.board[startx][starty+2] === enemyId){
            count++;
          }
        }

        if( (xrow === startx) && (yrow === starty+2) ){

          if(this.board[startx+1][starty+1] === 0){
            otherPos.push(new Move(startx+1, starty+1));
          }else if(this.board[startx+1][starty+1] === enemyId){
            count++;
          }

          if(this.board[startx+2][starty] === 0){
            otherPos.push(new Move(startx+2, starty));
          }else if(this.board[startx+2][starty] === enemyId){
            count++;
          }
        }

        if( (xrow === startx+1) && (yrow === starty+1) ){

          if(this.board[startx][starty+2] === 0){
            otherPos.push(new Move(startx, starty+2));
          }else if(this.board[startx][starty+2] === enemyId){
            count++;
          }

          if(this.board[startx+2][starty] === 0){
            otherPos.push(new Move(startx+2, starty));
          }else if(this.board[startx+2][starty] === enemyId){
            count++;
          }
        }

      }

      if(count === 0){
        return otherPos;
      }else{
        return [];
      }

    };

    Field.prototype.viable = function( array, other, botId, set ){
      var pos = [];
      count = 0;
      for (var i = array.length - 1; i >= 0; i--) {
        if(set){
          var y = other;
          var x = array[i];
        }else{
          var y = array[i];
          var x = other;
        }
        //var y = array[i][1];
        if(this.board[x][y] === 0){
          pos.push(new Move(x, y));
          count++;
        }else if(this.board[x][y] === botId){
          count++;
        }else{
          array.splice(i, 1);
        }
      }
      return (count === 2 ? pos : [] );
    }

    Field.prototype.possible = function( xRow, startX ){
      simplePos = xRow-startX;
      if( simplePos === 0 ){
        otherPos = [startX+1,startX+2];
      }else if( simplePos === 1 ){
        otherPos = [startX,startX+2];
      }else{
        otherPos = [startX+1,startX];
      }
      return otherPos;
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
      // Print("@@@@@\n");
      // var count = 0;
      // for (var i = 0; i < merged.length; i++) {
      //   var newline = (count === 2 ? "\n" : '' );
      //   Print(merged[i]+","+newline);
      //   var count = ( newline === "\n" ? 0 : count+1 );
      // }
      // Print("@@@@@\n");
      //
      // Print("@"+JSON.stringify(a)+"\n");
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
