$(function() {

    var DEBUG = 1;

    $( document ).ready(function(){
        // hide debug section if not in debug mode
        if(!DEBUG){
            $( "#debug" ).hide();
        }
    });

    function isNextTo(currentTile, selectedTile) {
        var dCx = parseFloat($(selectedTile).children("circle.emptyTile").attr("cx") - $(currentTile).children("circle.emptyTile").attr("cx"));
        var dCy = parseFloat($(selectedTile).children("circle.emptyTile").attr("cy") - $(currentTile).children("circle.emptyTile").attr("cy"));
        var distance = Math.sqrt(Math.pow(dCx,2)+Math.pow(dCy,2));
        return distance<(20*2);
    };

    function moveMarble(currentTile, nextTile) {
        // move the xml object to the right tile
        var nCx = $(nextTile).children("circle.emptyTile").attr("cx");
        var nCy = $(nextTile).children("circle.emptyTile").attr("cy");
        var marble = $(currentTile).children("circle.marble");
        $(nextTile).append(marble);
        $(marble).attr("cx", nCx);
        $(marble).attr("cy", nCy);
    }

    function move(currentTile, nextTile) {
        var cCx = $(currentTile).children("circle.emptyTile").attr("cx");
        var cCy = $(currentTile).children("circle.emptyTile").attr("cy");
        var nCx = $(nextTile).children("circle.emptyTile").attr("cx");
        var nCy = $(nextTile).children("circle.emptyTile").attr("cy");
        if($(nextTile).children("circle.marble").length == 0) {// if no marble -> empty tile
            moveMarble(currentTile, nextTile);
        } else {
            // find the next next tile
            var dx = Math.round((nCx - cCx) * 1000) / 1000;
            var dy = Math.round((nCy - cCy) * 1000) / 1000;
            var nextnCx = parseFloat(nCx) + parseFloat(dx);
            var nextnCy = parseFloat(nCy) + parseFloat(dy);
            var nextNextTile = $('circle.emptyTile').filter(function () {
                return (Math.abs($(this).attr("cx") - nextnCx) < 0.5) 
                                    && (Math.abs($(this).attr("cy") - nextnCy) < 0.5);
            }).parent();

            // recursive call to move the next marble
            move(nextTile, nextNextTile);

            moveMarble(currentTile, nextTile);
        }
    }

    var currentSelectedTile = null;
    $('g.tile').click( function(){
        if (currentSelectedTile) {
            currentSelectedTile.removeClass('active');
            if($(currentSelectedTile).children("circle.marble").length > 0 && isNextTo(currentSelectedTile, this)) {
                move(currentSelectedTile, this);
            }
        }
        $(this).addClass('active');
        currentSelectedTile = $(this);

        if(DEBUG) {
            // print debug tiles infos
            var circleEmptyTitle = $(this).children("circle.emptyTile").first();
            $( "#printCx" ).text(circleEmptyTitle.attr("cx"));
            $( "#printCy" ).text(circleEmptyTitle.attr("cy"));
            if($(this).has("circle.blackMarble").length) {
                $( "#printColor" ).text("Black marble");
            } else if($(this).has(".whiteMarble").length) {
                $( "#printColor" ).text("White marble");
            } else {
                $( "#printColor" ).text("Empty tile");
            }
        }
    });

    var board = null;

    $('#get-board').click( function(){
        $.ajax({
            method: "POST",
            url: "http://localhost:8080/get/init/board",
            success: function(json, statut){
                board = json;
                console.log(json);
                console.log("success with statut :" + statut);
                updateBoard(board);
            },
            error: function (resultat, statut, erreur) {
                console.log("error");
                alert("Erreur lors de l'appel");
                console.log(resultat, statut, erreur);
            },
            complete: function(response){
                console.log(response.responseJSON);
            }
        });
    });

    function updateBoard($board) {

        var whiteMarble = $('<circle class="marble whiteMarble" cx="0" cy="0" r="14" fill="url(#whiteMarble)"></circle>');
        var blackMarble = $('<circle class="marble blackMarble" cx="0" cy="0" r="14" fill="url(#blackMarble)"></circle>');

        var line;
        for (line = 0; line < $board.length; ++line) {
            var col;
            var realCol;
            var realLine = line + 1;
            for (col = 0, realCol = 1; col < $board[line].length; ++col) {

                var color = $board[line][col];
                console.log("Couleur : " + color);
                if (color < 0) {
                    continue;
                }

                var tile = $('g.tile.col-' + realCol + '.line-' + realLine).first();
                console.log("Ligne : " + realLine + " - Colonne : " + realCol);
                if (color == 1 && tile.find('circle.marble.whiteMarble').length == 0) {
                    console.log("Ajout d'une bille blanche !");
                    var emptyTile = tile.find('circle.emptyTile').first();
                    console.log(emptyTile);
                    var whiteMarbleToAppend = whiteMarble;
                    whiteMarbleToAppend.attr('cx', emptyTile.attr('cx'));
                    whiteMarbleToAppend.attr('cy', emptyTile.attr('cy'));
                    tile.append(whiteMarbleToAppend);
                    console.log(whiteMarbleToAppend);
                    //tile.find('circle.marble.blackMarble').remove();

                } else if (color == 2 && tile.find('circle.marble.blackMarble').length == 0) {
                    console.log("Ajout d'une bille noir !");
                    var emptyTile = tile.find('circle.emptyTile').first();
                    var blackMarbleToAppend = blackMarble;
                    blackMarbleToAppend.attr('cx', emptyTile.attr('cx'));
                    blackMarbleToAppend.attr('cy', emptyTile.attr('cy'));
                    tile.append(blackMarbleToAppend);
                    //tile.find('circle.marble.whiteMarble').remove();

                } else if (color == 0) {
                    console.log("Suppression de toutes les billes !");
                    tile.find('circle.marble').remove();

                }
                ++realCol;
            }
        }
    }
});

