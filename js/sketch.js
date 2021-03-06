var canvas;
var bg = null;
var player = {
    side: null,
    gridMouse: {},
    hoverHighlight: [],
    selectedPiece: null,
    view: null,
}
var loaded;
var incomingData;
var board;
var fontChess, fontIcons, fontText;
var checkMate = false;
var checkBreakers = [];
var activity = {};
var promotion = false;
var fieldFocus = null;
var textInput, textInputEl;
var startingNewGame = false;

var colors = {
    red: "#bd2d2d",
    orange: "#c47d1a",
    blue: "#43ace6",
    green: "#4a962c"
}

function preload() {
    fontChess = loadFont(chessIconFontPath);
    fontIcons = loadFont(fontAwesomeFontPath);
    fontText = loadFont(textFontPath);
}

function setup() {
    canvas = createCanvas(w, h);
    textFont(fontText);
    strokeJoin(ROUND);

    initialiseBoard();

    initTextField();
    getAllGames();
}

function draw() {
    if (bg)
        background(bg);
    cursor(ARROW);
    noFill();
    strokeWeight(1);
    stroke(board.sides[0].color);
    rect(0, 0, boardSize + marginX * 2, boardSize + marginY * 2);

    select("body").style("background", bg);
    selectAll("meta")[2].attribute("content", bg);

    if (loaded) {

        if (!loadedGame) {
            drawGameSelect();

            if (startingNewGame)
                drawNewGame();
        }

        else if (!player.side && board.sides.length == 2) {
            drawSideSelect();

        } else {
            push();

            drawGame();

            if (checkMate) {
                drawEndGame("CHECKMATE", board.check.side.enemy.name);
            }

            if (board.loss) {
                drawEndGame("NO MORE UNITS", board.loss.enemy.name);
            }

            if (getPlayerSideOfBoard().generalKIA) {
                drawGeneralKIA();
            }

            if (promotion) {
                drawPromotion();
            }

            if (player.side.name)

                if (player.view == board.sides[1].name) {
                    pop();
                }

            pop();

        }
    }
}

function changeView() {
    if (player.view == board.sides[0].name)
        player.view = board.sides[1].name
    else if (player.view == board.sides[1].name)
        player.view = board.sides[0].name
}

function boardLoop(fn) {
    let w = board.state.length;
    let h = board.state[0].length;
    for (let x = 1; x <= w; x++) {
        for (let y = h; y >= 1; y--) {
            fn(x, y);
        }
    }
}

function pieceLoop(fn) {
    for (let arr of Object.values(board.state))
        for (let tile of arr)
            if (tile) {
                fn(tile);
            }
}

function mouseGrid() {
    if (player.view == board.sides[0].name) {
        player.gridMouse.x = ceil((mouseX - marginX) / squareSize);
        player.gridMouse.y = 8 - ceil((mouseY - marginY) / squareSize) + 1;
    }
    else if (player.view == board.sides[1].name) {
        player.gridMouse.x = ceil((boardSize - (mouseX - marginX)) / squareSize);
        player.gridMouse.y = 8 - ceil((boardSize - (mouseY - marginY)) / squareSize) + 1;
    }

    player.hoverHighlight = [];
    if (player.selectedPiece && player.selectedPiece.type == ARTILLERY) {
        for (let move of player.selectedPiece.moves.ranged) {
            if (move.x == player.gridMouse.x - 1 && move.y == player.gridMouse.y - 1) {
                for (let x = -1; x <= 1; x++) {
                    player.hoverHighlight.push({ x: move.x + x, y: move.y, color: colors.red })
                }
                for (let y = -1; y <= 1; y += 2) {
                    player.hoverHighlight.push({ x: move.x, y: move.y + y, color: colors.red })
                }
            }
        }
    }
}

function selectPieceAtMouse() {
    if (player && player.gridMouse.x >= 1 && player.gridMouse.x <= 8 && player.gridMouse.y >= 1 && player.gridMouse.y <= 8) {
        let selection = board.state[player.gridMouse.x - 1][player.gridMouse.y - 1];

        if (selection == Null)
            player.selectedPiece = selection;

        // Limit selection to players' own side
        else if (selection.side.name == player.side.name && !selection.cooldown.current) {
            // Deselect, if clicking selected piece
            if (selection == player.selectedPiece)
                selection = player.selectedPiece = null;

            player.selectedPiece = selection;
            if (player.selectedPiece && board.isFirstMove)
                player.selectedPiece.getMoves();
            console.log(player.selectedPiece);
        }
    }
}

function getPieceAtCoordinate(col, row) {
    // eg col: A, row: 1
    let boardPointer = board.state[col - 1][row - 1];
    if (boardPointer != Null)
        return boardPointer;
    else
        return false;
}

function getPiecesOfType(string) {
    let arr = [];
    boardLoop((x, y) => {
        let boardPointer = board.state[x - 1][y - 1];
        if (boardPointer && boardPointer.type == string)
            arr.push(boardPointer);
    })

    return arr;
}

function getSideAtCoordinate(col, row) {
    let boardPointer = board.state[col - 1][row - 1];
    if (boardPointer != null)
        return boardPointer.side;
    else
        return false;
}

function getPlayerSideOfBoard() {
    if (player.side)
        return player.side.name == board.sides[0].name ? board.sides[0] : board.sides[1];
    else return null;
}

function resetBoard() {
    if (loadedGame.name) {
        boardData.remove();
        initialiseBoard();
        setAllActivity(false);
        player.side = null;
        board.active = false;
        promotion = false;
        console.log("sending data:")
        boardData.set(board);
        checkMate = false;
        noLoop();
        loop();
    } else {
        endGame();
    }

}

function initialiseBoard() {
    board = new Board(true);

    var whiteSide = new Side("White", "#e6d9ca");
    whiteSide.definePieces([
        // new Tank(whiteSide, D, 2),
        new Infantry(whiteSide, A, 2),
        new Infantry(whiteSide, B, 2),
        new Infantry(whiteSide, C, 2),
        new Infantry(whiteSide, D, 2),
        new Infantry(whiteSide, E, 2),
        new Infantry(whiteSide, F, 2),
        new Infantry(whiteSide, G, 2),
        new Infantry(whiteSide, H, 2),
        new Artillery(whiteSide, A, 1),
        new Paratrooper(whiteSide, B, 1),
        new Sniper(whiteSide, C, 1),
        new Tank(whiteSide, D, 1),
        new General(whiteSide, E, 1), // E1
        new Sniper(whiteSide, F, 1),
        new Paratrooper(whiteSide, G, 1),
        new Artillery(whiteSide, H, 1)
    ]);

    var blackSide = new Side("Black", "#26201c");
    blackSide.definePieces([
        // new General(blackSide, D, 5),
        // new Infantry(blackSide, D, 6),
        new Infantry(blackSide, A, 7),
        new Infantry(blackSide, B, 7),
        new Infantry(blackSide, C, 7),
        new Infantry(blackSide, D, 7),
        new Infantry(blackSide, E, 7),
        new Infantry(blackSide, F, 7),
        new Infantry(blackSide, G, 7),
        new Infantry(blackSide, H, 7),
        new Artillery(blackSide, A, 8),
        new Paratrooper(blackSide, B, 8),
        new Sniper(blackSide, C, 8),
        new Tank(blackSide, D, 8), // D8
        new General(blackSide, E, 8),
        new Sniper(blackSide, F, 8),
        new Paratrooper(blackSide, G, 8),
        new Artillery(blackSide, H, 8)
    ]);
    player.view = board.sides[0].name;
}

function setupChessGlyphStyle(size = iconSize) {
    strokeWeight(6);
    textFont(fontChess, size)
    textAlign(CENTER, CENTER)
}

function setupFontAwesomeGlyphStyle(size = iconSize) {
    strokeWeight(6);
    textFont(fontIcons, size)
    textAlign(CENTER, CENTER)
}

function setPlayerActivity(bool) {
    if (player.side) {
        for (let side of board.sides)
            if (side.name == player.side.name)
                activity[side.name] = bool;
        console.log("Player Activity Changed:")
        console.log(activity)
        activityData.set(activity);
    }
}
function setAllActivity(bool) {
    for (let side in activity)
        side.active = bool;
    console.log("Reset Player Activity:")
    console.log(activity)
    activityData.set(activity);
}

// // Remove player when closing the window/refreshing
window.addEventListener('beforeunload', playerLeave);
// Remove player when window loses focus (mobile OR desktop)
window.addEventListener('blur', () => {
    playerLeave();
    fieldFocus = null;
});
// Re-add player when window regains focus
window.addEventListener('focus', playerReturn);


function playerLeave() {
    setPlayerActivity(false);
}
function playerReturn() {
    setPlayerActivity(true);
}

function promote(piece, target) {

    switch (target) {
        case TANK:
            piece = new Tank(piece.side, piece.position.x, piece.position.y);
            break;
        case ARTILLERY:
            piece = new Artillery(piece.side, piece.position.x, piece.position.y);
            break;
        case SNIPER:
            piece = new Sniper(piece.side, piece.position.x, piece.position.y);
            break;
        case PARATROOPER:
            piece = new Paratrooper(piece.side, piece.position.x, piece.position.y);
            break;
    }

    board.state[piece.position.index.x][piece.position.index.y] = piece;

    piece.getMoves();
    promotion = false;


    player.selectedPiece = Null;

    if (board.isFirstMove)
        board.isFirstMove = false;

    // if (destination != Null)
    //     this.side.graveyard.push(destination.type);

    board.turn = piece.side.enemy;

    console.log("sending data:")
    console.log(board)
    boardData.set(board);
}


function setGlyph(type) {
    switch (type) {
        case INFANTRY:
            return glyphs.chess.infantry;
        case ARTILLERY:
            return glyphs.chess.artillery;
        case PARATROOPER:
            return glyphs.chess.paratrooper;
        case SNIPER:
            return glyphs.chess.sniper;
        case TANK:
            return glyphs.chess.tank;
        case GENERAL:
            return glyphs.chess.general;
    }
}

function drawGameSelect() {
    push();

    let headingSize = !mobile ? 24 : 18;
    let nameSize = !mobile ? 18 : 14;
    let itemHeight = !mobile ? 50 : 30;
    let itemMargin = !mobile ? 25 : 10;
    noStroke();


    if (allGames) {
        fill(colors.white);
        textSize(headingSize);
        textAlign(LEFT, TOP)
        text("Join a game:", marginX, marginY / 2);
        buttons.gameListRefresh.draw(width - marginX - headingSize, marginY / 2 + headingSize / 4, headingSize)
        if (allGames.length) {
            let i = 0;
            for ([key, value] of Object.entries(allGames))
                if (key.includes("game")) {
                    let game = allGames[key];
                    if (!game.button)
                        game.button = new Button((x, y, self) => {
                            rect(x, y, self.width, self.height, 3);

                            fill(colors.black);
                            textAlign(LEFT, CENTER)
                            textSize(nameSize)
                            text(game.name, 15, self.height / 2 - nameSize / 8);
                        })
                    game.button.draw(marginX, marginY / 2 + itemHeight + ((i) * (itemHeight + itemMargin)), boardSize, itemHeight);
                    i++;
                }
        } else {
            fill(darken(color(colors.white), 0.5));
            textAlign(CENTER, CENTER);
            textSize(nameSize);
            text("There are currently no games in progress", width / 2, height / 2)
        }
        buttons.newGame.draw(width / 2 - 125 / 2, boardSize + marginY * 1.25, 125, 35);
    } else {
        fill(darken(color(colors.white), 0.5));
        textAlign(CENTER, CENTER);
        textSize(nameSize);
        text("Loading...", width / 2, height / 2);

    }
    pop();
}

function drawNewGame() {
    push();
    fill(0, 0, 0, 200)
    noStroke();
    rect(0, 0, width, height);
    fill(255);

    textSize(18);
    textFields.newGame.draw(width / 2 - boardSize / 2, height / 2 - 50, boardSize);

    buttons.newGameConfirm.draw(width / 2 - 125 / 2, height / 2 + 50, 125, 35)
    let cancelSize = !mobile ? 24 : 18;
    buttons.newGameCancel.draw(width - marginX - cancelSize, marginY / 2 + cancelSize / 4, cancelSize)
    pop();
}

function drawSideSelect() {
    push();

    fill(colors.white);
    noStroke();
    textSize(!mobile ? 30 : 26);
    textAlign(CENTER, TOP);
    text(`Joining game:\u{000D}\u{000A}${loadedGame.name}`, width / 2, marginY);
    textSize(!mobile ? 24 : 20);
    text("Who do you serve?", width / 2, height / 2 - squareSize * 1.5);

    let iconW = squareSize;
    let iconH = squareSize * 1.25;

    buttons.selectWhite.draw(width / 2 - iconW * 1.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.selectBlack.draw(width / 2 + iconW * 0.5, height / 2 - iconH / 2, iconW, iconH);

    pop();
}

function drawGame() {
    buttons.resetBoard.draw(width / 2 - 62.5, height - marginY / 2 + 5 - 17.5, 125, 35)
    translate(marginX, marginY)

    if (player.view == board.sides[1].name) {
        push();
        translate(width - marginX * 2, height - marginY * 2);
        rotate(PI);
    }

    board.drawBoard();
    mouseGrid();
    board.drawPieces();

    if (player.selectedPiece)
        player.selectedPiece.showAvailableMoves();

    if (!mobile) {
        let x = 0;
        let increment = 1;
        for (let side of board.sides) {
            let y = 0;
            push();
            if (x == 0) {
                translate(0, -marginY / 1.5);
                textAlign(LEFT, CENTER);
            } else {
                translate(boardSize, -marginY / 1.5)
                textAlign(RIGHT, CENTER);
                increment *= -1;
            }
            if (player.view == board.sides[1].name) {
                increment *= -1;
                rotate(PI);
                translate(0, -height + marginY / 1.5);
            }
            setupChessGlyphStyle(20);
            strokeWeight(3);
            for (let piece of side.graveyard) {
                fill(side.enemy.color);
                stroke(side.color);
                text(setGlyph(piece), y * 15, 0);
                y += increment;
            }
            pop();
            x++;
        }
    }
}

function drawEndGame(msg, winner) {
    push();
    translate(-marginX, -marginY);
    if (player.view == board.sides[1].name) {
        push();
        translate(width, height);
        rotate(PI);
    }

    fill(0, 0, 0, 175)
    noStroke();
    rect(0, 0, width, height);

    fill(colors.white);
    textSize(30);
    textAlign(CENTER, CENTER);
    text(msg, width / 2, height / 2 - 30);
    textSize(20);
    text(`${winner} is victorious!`, width / 2, height / 2 + 30);
    buttons.endGame.draw(width / 2 - 62.5, height - 75, 125, 35)
    pop();
}

function drawPromotion() {
    push();
    translate(-marginX, -marginY);
    if (player.view == board.sides[1].name) {
        push();
        translate(width, height);
        rotate(PI);
    }

    fill(0, 0, 0, 175)
    noStroke();
    rect(0, 0, width, height);

    let iconW = squareSize;
    let iconH = squareSize * 1.25;

    buttons.promote.tank.draw(width / 2 - iconW * 3.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.artillery.draw(width / 2 - iconW * 1.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.sniper.draw(width / 2 + iconW * 0.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.paratrooper.draw(width / 2 + iconW * 2.5, height / 2 - iconH / 2, iconW, iconH);

    pop();
}

function drawGeneralKIA() {
    push();
    translate(-marginX, -marginY);
    if (player.view == board.sides[1].name) {
        push();
        translate(width, height);
        rotate(PI);
    }

    fill(0, 0, 0, 175)
    noStroke();
    rect(0, 0, width, height);

    fill(colors.white);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("GENERAL HAS BEEN KIA", width / 2 - boardSize / 2, marginY * 2, boardSize);
    textSize(20);
    text(`You can either retreat (END GAME), or keep fighting with all units taking a morale hit (1HP)`, width / 2 - boardSize / 2, marginY * 3, boardSize);


    buttons.retreat.draw(width / 2 - (125 + 20), height - 75, 125, 35, true);
    buttons.keepFighting.draw(width / 2 + 20, height - 75, 175, 35, true);

    pop();
}

function initTextField() {

    textInput = createInput('');
    textInput.id("textInput");

    textInputEl = document.getElementById('textInput');
    textInputEl.addEventListener("input", (e) => {
        console.log(e);
        fieldFocus.input(e);
    });
}