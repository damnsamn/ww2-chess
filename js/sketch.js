var canvas;
var bg = null;
var player = {
    side: null,
    gridMouse: {},
    selectedPiece: null,
    view: null
}
var loaded;
var incomingData;
var board;
var fontIcon, fontText;
var checkMate = false;
var checkBreakers = [];
var activity = {};
var promotion = false;
var fieldFocus = null;
var textInput, textInputEl;
var startingNewGame = false;

var colors = {
    red: "#bd2d2d",
    blue: "#43ace6",
    green: "#4a962c"
}

function preload() {
    fontIcon = loadFont(iconFontPath);
    fontText = loadFont(textFontPath);
}

function setup() {
    canvas = createCanvas(w, h);
    textFont(fontText);


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
                drawCheckMate();
            }

            if (promotion) {
                drawPromotion();
            }

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

// TODO: Add Board argument
function boardLoop(fn) {
    let w = board.state.length;
    let h = board.state[0].length;
    for (let x = 1; x <= w; x++) {
        for (let y = h; y >= 1; y--) {
            fn(x, y);
        }
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
}

function selectPieceAtMouse() {
    if (player && player.gridMouse.x >= 1 && player.gridMouse.x <= 8 && player.gridMouse.y >= 1 && player.gridMouse.y <= 8) {
        let selection = board.state[player.gridMouse.x - 1][player.gridMouse.y - 1];

        if (selection == Null)
            player.selectedPiece = selection;

        // Limit selection to players' own side
        else if (selection.side.name == player.side.name) {
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

function resetBoard() {
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
}

function initialiseBoard() {
    board = new Board(true);

    var whiteSide = new Side("White", "#EEEEEE");
    whiteSide.definePieces([
        // new Rook(whiteSide, A, 1),
        // new King(whiteSide, E, 1),
        // new Rook(whiteSide, H, 1),
        new Pawn(whiteSide, A, 2),
        new Pawn(whiteSide, B, 2),
        new Pawn(whiteSide, C, 2),
        new Pawn(whiteSide, D, 2),
        new Pawn(whiteSide, E, 2),
        new Pawn(whiteSide, F, 2),
        new Pawn(whiteSide, G, 2),
        new Pawn(whiteSide, H, 2),
        new Rook(whiteSide, A, 1),
        new Knight(whiteSide, B, 1),
        new Bishop(whiteSide, C, 1),
        new Queen(whiteSide, D, 1),
        new King(whiteSide, E, 1), // E1
        new Bishop(whiteSide, F, 1),
        new Knight(whiteSide, G, 1),
        new Rook(whiteSide, H, 1)
    ]);

    var blackSide = new Side("Black", "#21252b");
    blackSide.definePieces([
        // new King(blackSide, E, 8),
        // new Queen(blackSide, H, 8),
        new Pawn(blackSide, A, 7),
        new Pawn(blackSide, B, 7),
        new Pawn(blackSide, C, 7),
        new Pawn(blackSide, D, 7),
        new Pawn(blackSide, E, 7),
        new Pawn(blackSide, F, 7),
        new Pawn(blackSide, G, 7),
        new Pawn(blackSide, H, 7),
        new Rook(blackSide, A, 8),
        new Knight(blackSide, B, 8),
        new Bishop(blackSide, C, 8),
        new Queen(blackSide, D, 8), // D8
        new King(blackSide, E, 8),
        new Bishop(blackSide, F, 8),
        new Knight(blackSide, G, 8),
        new Rook(blackSide, H, 8)
    ]);
    player.view = board.sides[0].name;
}

function setupGlyphStyle(size = iconSize) {
    strokeWeight(6);
    textFont(fontIcon, size)
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
        case QUEEN:
            piece = new Queen(piece.side, piece.position.x, piece.position.y);
            break;
        case ROOK:
            piece = new Rook(piece.side, piece.position.x, piece.position.y);
            break;
        case BISHOP:
            piece = new Bishop(piece.side, piece.position.x, piece.position.y);
            break;
        case KNIGHT:
            piece = new Knight(piece.side, piece.position.x, piece.position.y);
            break;
    }

    board.state[piece.position.index.x][piece.position.index.y] = piece;

    piece.getMoves();
    promotion = false;


    player.selectedPiece = Null;

    if (board.isFirstMove)
        board.isFirstMove = false;

    if (destination != Null)
        this.side.graveyard.push(destination.type);

    board.turn = piece.side.enemy;

    console.log("sending data:")
    console.log(board)
    boardData.set(board);
}


function setGlyph(type) {
    switch (type) {
        case PAWN:
            return glyphs.pawn;
        case ROOK:
            return glyphs.rook;
        case KNIGHT:
            return glyphs.knight;
        case BISHOP:
            return glyphs.bishop;
        case QUEEN:
            return glyphs.queen;
        case KING:
            return glyphs.king;
    }
}

function drawGameSelect() {
    push();

    let headingSize = !mobile ? 24 : 18;
    let nameSize = !mobile ? 18 : 14;
    let itemHeight = !mobile ? 50 : 30;
    let itemMargin = !mobile ? 25 : 10;


    noStroke();
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
    buttons.newGame.draw(width / 2 - 125 / 2, boardSize + marginY * 1.25, 125, 35)

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
            setupGlyphStyle(20);
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

function drawCheckMate() {
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
    fill(255);
    textSize(30);
    textAlign(CENTER, CENTER);
    text(`CHECKMATE`, width / 2, height / 2 - 30);
    textSize(20);
    text(`${board.check.side.enemy.name} is victorious!`, width / 2, height / 2 + 30);
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

    buttons.promote.queen.draw(width / 2 - iconW * 3.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.rook.draw(width / 2 - iconW * 1.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.bishop.draw(width / 2 + iconW * 0.5, height / 2 - iconH / 2, iconW, iconH);
    buttons.promote.knight.draw(width / 2 + iconW * 2.5, height / 2 - iconH / 2, iconW, iconH);

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