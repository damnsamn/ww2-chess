
// Input Events
function mousePressed() {
    let screenEndGame = player.side && (checkMate || board.loss);
    let screenGeneralKIA = getPlayerSideOfBoard() ? getPlayerSideOfBoard().generalKIA : false;
    let screenPromotion = player.side && promotion;
    let screenSideSelect = !player.side;
    let screenGamePlay = player.side && !promotion && !checkMate && !screenGeneralKIA;
    let screenGameSelect = !loadedGame && !startingNewGame;
    let screenNewGame = !loadedGame && startingNewGame;

    fieldFocus = null;

    // Gameplay
    if (screenGamePlay) {
        buttons.resetBoard.catchClick(resetBoard);

        if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height && !checkMate) {
            if (player.side && board.turn.name == player.side.name) {
                let selection = player.selectedPiece;
                selectPieceAtMouse();
                if (selection)
                    selection.tryMoveAt(player.gridMouse.x - 1, player.gridMouse.y - 1);
            }
        }
    }
    // Game Selection
    if (screenGameSelect) {
        let i = 0;
        for ([key, value] of Object.entries(allGames))
            if (key.includes("game")) {
                let game = allGames[key];
                if (game.button)
                    game.button.catchClick(() => joinGame(key))
                i++;
            }

        buttons.newGame.catchClick(() => {
            startingNewGame = true;
        });

        buttons.gameListRefresh.catchClick(() => {
            getAllGames();
        });
    }

    if (screenNewGame) {
        textFields.newGame.catchClick();

        buttons.newGameConfirm.catchClick(() => {
            let fieldVal = textFields.newGame.value;
            if (fieldVal) {
                newGame(fieldVal);
                startingNewGame = false;
            } else {
                alert("Please enter a game title")
            }
        });

        buttons.newGameCancel.catchClick(() => {
            textFields.newGame.value = '';
            startingNewGame = false;
        });
    }

    // Side Selection
    if (screenSideSelect) {
        buttons.selectWhite.catchClick(() => {
            player.side = board.sides[0];
            player.view = board.sides[0].name;
            board.active = true;
            setPlayerActivity(true);
            // initialiseBoard();
        });

        buttons.selectBlack.catchClick(() => {
            player.side = board.sides[1];
            player.view = board.sides[1].name;
            board.active = true;
            setPlayerActivity(true);
            // initialiseBoard();
        });
    }

    // Promotion
    if (screenPromotion) {
        console.log("PROMOTION CLICK")
        buttons.promote.tank.catchClick(() => { promote(promotion, TANK) })
        buttons.promote.artillery.catchClick(() => { promote(promotion, ARTILLERY) })
        buttons.promote.sniper.catchClick(() => { promote(promotion, SNIPER) })
        buttons.promote.paratrooper.catchClick(() => { promote(promotion, PARATROOPER) })

    }

    // General has been KIA
    if (screenGeneralKIA) {
        buttons.retreat.catchClick(endGame);
        buttons.keepFighting.catchClick(Side.generalDeath(getPlayerSideOfBoard()));
    }

    // Checkmate or loss of pieces
    if (screenEndGame) {
        buttons.endGame.catchClick(endGame);
    }
}

function mouseClicked() {
    if (fieldFocus)
        document.getElementById('textInput').focus();
}

function mouseReleased() {
}

function keyPressed(e) {
    var capsLock = e.getModifierState('CapsLock');

    if (keyCode == 32) {
        changeView();
    }
    if (keyCode == ESCAPE) {
        resetBoard();
    }
}