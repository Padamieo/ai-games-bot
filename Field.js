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
          // for (var i = moves.length - 1; i >= 0; i--) {
          //   if(!(i % 2 === 0)){
          //     moves.splice(i, 1);
          //   }
          // }
        }

        Print("num:"+loc.length+"\n");

        if(loc.length === 0 ){
          Print("no placment yet\n");
          // if(loc.length < 0){
          //
          //   locX = (loc[0].x-startX);
          //   locY = (loc[0].y-startY);
          //
          //   placements = this.removeRequested( this.potentialPlacements( locX, locY ), locX, locY );
          //
          //   idealmoves = this.covertToMoves( placements, startX, startY );
          //   var out = this.diff( moves, idealmoves );
          //
          //   moves = out;
          // }

        }else{

          if(loc.length > 1 ){
            //Print("enemy:"+info[botId]+"\n");
            //Print("enemy:"+info[enemyId]+"\n");
            Print("our:"+JSON.stringify(loc)+"\n");
            var a = [];
            var b = [];
            var c = [];
            for (var i = 0; i < loc.length; i++) {

              xRow = loc[i].x;
              yRow = loc[i].y;

              c.push(this.diagonall( xRow, yRow, startX, startY, enemyId ));

              var positionX = this.possible( xRow, startX );
              a.push(this.viable( positionX, yRow, botId, true ));

              var positionY = this.possible( yRow, startY );
              b.push(this.viable( positionY, xRow, botId, false ));

            }
            Print("xrows"+JSON.stringify(a)+"\n");
            Print("yrows"+JSON.stringify(b)+"\n");
            out = [];

            //
            //Print("c:"+JSON.stringify(c)+"\n");
            var cArr = [];
            for (var i = 0; i < c.length; i++) {
              cArr.push(c[i].length);
            }
            var sumZ = cArr.reduce((a, b) => a + b, 0);
            var z = cArr.includes(1, 1);
            if(z){
              Print("cArr:"+JSON.stringify(cArr)+"\n");
              for(var i = 0; i < cArr.length; i++){
                if(cArr[i] === 1){
                  Print("w:"+JSON.stringify(c[i])+"\n");
                  out.push(c[i][0]);
                }
              }
            }

            //
            var aArr = [];
            for (var i = 0; i < a.length; i++) {
              aArr.push(a[i].length);
            }
            var sumE = aArr.reduce((a, b) => a + b, 0);
            var e = aArr.includes(1, 1);
            if(e){
              Print("aArr:"+JSON.stringify(aArr)+"\n");
              for(var i = 0; i < aArr.length; i++){
                if(aArr[i] === 1){
                  Print("w:"+JSON.stringify(a[i])+"\n");
                  out.push(a[i][0]);
                }
              }
            }

            //
            var bArr = [];
            for (var i = 0; i < b.length; i++) {
              bArr.push(b[i].length);
            }
            var sumG = bArr.reduce((a, b) => a + b, 0);
            var g = bArr.includes(1, 1);
            if(g){
              Print("bArr:"+JSON.stringify(bArr)+"\n");
              for(var i = 0; i < bArr.length; i++){
                if(bArr[i] === 1){
                  Print("w:"+JSON.stringify(b[i])+"\n");
                  out.push(b[i][0]);
                }
              }
            }

            if(z === true || g === true || e === true){

              Print("WIN WITH SINGLE\n");
              Print("WIN:"+JSON.stringify(out)+"\n");
              moves = out;
            }else{
              Print("fallback\n");
              Print("WIN:"+JSON.stringify(c)+"\n");
              Print("WIN:"+JSON.stringify(a)+"\n");
              Print("WIN:"+JSON.stringify(b)+"\n");
              //Print("b:"+JSON.stringify(sumG)+"\n");
              for(var i = 0; i < bArr.length; i++){
                for(var x = 0; x < b[i].length; x++){
                  Print("b:"+JSON.stringify(b[i][x])+"\n");
                }
              };

            }


          }

        }


      }

      return moves;
    };

    Field.prototype.diagonall = function( xrow, yrow, startx, starty, enemyId ){
      otherPos = [];
      count = 0;
      //if(xrow === yrow){
        // for (var i = 0; i < 2; i++) {
        //   var x = startx+i;
        //   var y = starty+i;
        //   if(xrow != x && yrow != y ){
        //
        //     if(this.board[x][y] === 0){
        //       otherPos.push(new Move(x, y));
        //     }else if(this.board[x][y] === enemyId){
        //       count++;
        //     }
        //   }
        // }
      //}else{

        // if( (xrow === startx) && (yrow === starty) ){
        //
        //   if(this.board[startx+1][starty+1] === 0){
        //     otherPos.push(new Move(startx+1, starty+1));
        //   }else if(this.board[startx+1][starty+1] === enemyId){
        //     count++;
        //   }
        //
        //   if(this.board[startx+2][starty+2] === 0){
        //     otherPos.push(new Move(startx+2, starty+2));
        //   }else if(this.board[startx+2][starty+2] === enemyId){
        //     count++;
        //   }
        // }
        //
        // if( (xrow === startx+2) && (yrow === starty+2) ){
        //
        //   if(this.board[startx+1][starty+1] === 0){
        //     otherPos.push(new Move(startx+1, starty+1));
        //   }else if(this.board[startx+1][starty+1] === enemyId){
        //     count++;
        //   }
        //
        //   if(this.board[startx][starty] === 0){
        //     otherPos.push(new Move(startx, starty));
        //   }else if(this.board[startx][starty] === enemyId){
        //     count++;
        //   }
        // }

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

      //}

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




    Field.prototype.diagonalCheck = function( array, id ){
      count = 0;
      ideal = [];
      for (var i = 0; i < array.length; i++) {
        var x = array[i][0];
        var y = array[i][1];
        if (this.board[x][y] === id) {
          count++;
        }else if (this.board[x][y] === 0) {
          ideal.push(new Move(x, y));
        }
      }
      return ideal;
    };

    Field.prototype.arrayMatch = function( arrA, arrB ) {
      if(arrA.length !== arrB.length) return false;
      var cA = arrA.slice().sort().join(",");
      var cB = arrB.slice().sort().join(",");
      return cA === cB;
    };

    Field.prototype.exists = function( arr, elem, value) {
      return arr.some(function(el) {
        return el[elem] === value;
      });
    };

    Field.prototype.direction = function( arr, value) {
      var add = 0;
      for (var i = 0; i < arr.length; i++) {
        add = add+arr[i][value];
      }
      return (add/arr.length === arr[0][value] ? 1 : 0 );
    };

    Field.prototype.diff = function(a, b) {
      return b.filter(x => a.indexOf(x) == -1);
    };

    Field.prototype.covertToMoves = function( arr, startX, startY ){
      array = [];
      for (var i = 0; i < arr.length; i++) {
        var x = arr[i][0]+startX;
        var y = arr[i][1]+startY;
        array.push(new Move( x, y ));
      }
      return array;
    };

    Field.prototype.removeRequested = function( arr, x, y ){
      for (var i = arr.length - 1; i >= 0; i--) {
        if(JSON.stringify(arr[i]) === JSON.stringify([x, y]) ) {
          arr.splice(i, 1);
        }
      }
      return arr;
    };

    Field.prototype.removeDuplicates = function(arr){
      var hash = {};
      var out = [];
      for (var i = 0, l = arr.length; i < l; i++) {
        var key = arr[i].join('|');
        if (!hash[key]) {
          out.push(arr[i]);
          hash[key] = 'found';
        }
      }
      return out;
    };

    Field.prototype.potentialPlacements = function ( x, y ) {
      var array = [];

      //00, 01, 02
      //10, 11, 12
      //20, 21, 22

      if(x === 1 && y === 1){
        array.push([0,0]);
        array.push([1,0]);
        array.push([2,0]);
        array.push([2,1]);
        array.push([2,2]);
        array.push([1,2]);
        array.push([0,2]);
        array.push([0,1]);
      }else{
        if(x === 0 || (x === 0 && y === 2) || (x === 0 && y === 1) ){
          array.push([0,0]);
          array.push([0,1]);
          array.push([0,2]);
        }

        if(x === 0 && y === 1){
          array.push([1,1]);
          array.push([2,1]);
        }

        if((y === 0) || (x === 2 && y === 0) || (x === 1 && y === 0) ){
          array.push([0,0]);
          array.push([1,0]);
          array.push([2,0]);
        }

        if(x === 1 && y === 0){
          array.push([1,1]);
          array.push([1,2]);
        }

        if((x === 0 && y === 0) || (x === 2 && y === 2)){
          array.push([0,0]);
          array.push([1,1]);
          array.push([2,2]);
        }

        if((x === 2 && y === 0) || (x === 0 && y === 2)){
          array.push([0,2]);
          array.push([1,1]);
          array.push([2,0]);
        }

        if( y === 2 || (x === 0 && y === 2) || (x === 1 && y === 2) ){
          array.push([0,2]);
          array.push([1,2]);
          array.push([2,2]);
        }

        if(x === 1 && y === 2){
          array.push([1,1]);
          array.push([1,0]);
        }

        if (x === 2 || (x === 2 && y === 0)  || (x === 2 && y === 1)){
          array.push([2,0]);
          array.push([2,1]);
          array.push([2,2]);
        }

        if(x === 2 && y === 1){
          array.push([1,1]);
          array.push([0,1]);
        }
      }

      array = this.removeDuplicates(array);

      return  array;
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
