
if(info[botId] === 1 && info[enemyId] === 1){
  Print("P1E1\n");
  //if(loc.length < 0){
    locX = (loc[0].x-startX);
    locY = (loc[0].y-startY);

    placements = this.removeRequested( this.potentialPlacements( locX, locY ), locX, locY );

    if(info[enemyId] === 1){
      //Print("@E@"+JSON.stringify(enemyloc)+"\n");

      var elocX = (enemyloc[0].x-startX);
      var elocY = (enemyloc[0].y-startY);
      var analyse = [elocX,elocY];

      Print("@V@"+JSON.stringify(placements)+"\n");
      Print("@V@"+JSON.stringify(analyse)+"\n");

      var value = false;
      for (var i = 0; i < placements.length; i++) {
        if(this.arrayMatch( placements[i], analyse)){
          value = true;
        }
      }

      if(value === true){
        Print("@x@"+elocX+"-"+locX+"\n");
        Print("@y@"+elocY+"-"+locX+"\n");

        if( (elocX === elocY) && (locX === locY) ){
          Print("@x@DIA\n");
          //found one diagonal
          for (var i = placements.length - 1; i >= 0; i--) {
            if(placements[i][0] === placements[i][1]){
              placements.splice(i, 1);
            }
          }
        }else{
          if(elocX === locX){
            Print("@x@DIA\n");
            for (var i = placements.length - 1; i >= 0; i--) {
              if(placements[i][0] === locX){
                placements.splice(i, 1);
              }
            }
          }else if(elocY === locY){
            Print("@x@YYY\n");
            for (var i = placements.length - 1; i >= 0; i--) {
              if(placements[i][1] === locY){
                placements.splice(i, 1);
              }
            }
          }else{
            Print("@@UNKOWN\n");


          }
        }

      }else{
        //default as it does not block our action in any way action
      }
      Print("@E@"+JSON.stringify(placements)+"\n");

    }

    idealmoves = this.covertToMoves( placements, startX, startY );
    var out = this.diff( moves, idealmoves );

    // Print("@1@"+JSON.stringify(out)+"\n");
    // Print("@A@"+JSON.stringify(moves)+"\n");
    // Print("@B@"+JSON.stringify(idealmoves)+"\n");

    //moves = out;
  //}
}

        if(info[botId] === 2 && (info[enemyId] === 0 || info[enemyId] === 1 )){
          Print("P2E0/1\n");
          var dirX = this.direction( loc, 'x' );
          var dirY = this.direction( loc, 'y' );

          if(dirX === 0 && dirY === 0 ){

            tlbr = [[startX,startY], [startX+1, startY+1], [startX+2, startY+2]];
            var ideal = this.diagonalCheck( tlbr, botId );

            if(ideal.length === 1){
              moves = ideal;
            }
            //Print("##"+JSON.stringify(potential)+"\n");

            trbl = [[startX+2,startY], [startX+1, startY+1], [startX, startY+2]];
            var ideal2 = this.diagonalCheck( trbl, botId );

            if(ideal2.length === 1){
              moves = ideal;
            }

            Print("##DIAGONAL\n");
            Print("##"+JSON.stringify(ideal)+"\n");
            Print("##"+JSON.stringify(ideal2)+"\n");

          }else if( (dirX === 1) && (dirY === 0) ){

            Print("##OTHERY\n");
            var ideal = [];
            for (var a = startY; a < startY + 3; a++) {
              if(this.exists( loc, 'y', a) === false){
                ideal.push(new Move(loc[0].x, a));
              }
            }

            if(info[enemyId] === 0){
              moves = ideal;
            }else{

              Print("##"+JSON.stringify(moves)+"\n");
              var out = this.diff( moves, ideal );
              Print("##"+JSON.stringify(out)+"\n");

              if(out.length <= 1){
                //moves = ideal;
              }
            }

          }else if( (dirX === 0) && (dirY === 1) ){

            Print("##OTHERX\n");
            var ideal = [];
            for (var x = startX; x < startX + 3; x++) {
              if(this.exists( loc, 'x', x) === false){
                ideal.push(new Move(x, loc[0].y));
              }
            }

            if(info[enemyId] === 0){
              moves = ideal;
            }else{

              Print("##"+JSON.stringify(moves)+"\n");
              var out = this.diff( moves, ideal );
              Print("##"+JSON.stringify(out)+"\n");
              if(out.length <= 1){
                //moves = ideal;
              }

            }

          }else{

            Print("##Error\n");
            Print("##"+dirX+","+dirY+"\n");

          }

        }
