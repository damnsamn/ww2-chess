class Board {
    constructor(isFirstMove = false) {
        this.active = false;
        this.sides = [];
        this.turn = Null;
        this.state = [
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null],
            [Null, Null, Null, Null, Null, Null, Null, Null]
        ];
        this.isFirstMove = isFirstMove;
        this.lastMove = Null;
        this.check = Null;
    }

    drawBoard() {
        noStroke();
        boardLoop(function (x, y) {
            push();
            translate((x - 1) * squareSize, (8 - y) * squareSize);

            // Set alternating colors
            if ((x % 2 == 0 && y % 2 == 0) || (x % 2 != 0 && y % 2 != 0))
                fill(board.sides[1].color);
            else
                fill(board.sides[0].color);

            rect(0, 0, squareSize, squareSize);

            if (board.lastMove.length)
                for (let tile of board.lastMove)
                    if (tile.x == x - 1 && tile.y == y - 1) {
                        push();
                        let c = color(tile.color);
                        c.setAlpha(75);
                        fill(c);
                        rect(0, 0, squareSize, squareSize);
                        pop();
                    }


            if (player.hoverHighlight.length)
                for (let tile of player.hoverHighlight)
                    if (tile.x == x - 1 && tile.y == y - 1) {
                        push();
                        let c = color(tile.color);
                        c.setAlpha(75);
                        fill(c);
                        rect(0, 0, squareSize, squareSize);
                        pop();
                    }


            if (board.check) {
                if (board.check.position.x == x && board.check.position.y == y) {
                    push();
                    let c = color(colors.red);
                    c.setAlpha(115);
                    fill(c);
                    rect(0, 0, squareSize, squareSize);
                    pop();
                }
            }



            fill(board.sides[0].color);

            textStyle(BOLD);
            textAlign(CENTER, CENTER);


            // Draw coordinate labels
            if (x == A || x == H) {
                push();
                switch (x) {
                    case A:
                        translate(-squareSize * 1.5, 0);
                    case H:
                        translate(squareSize * 1.25, squareSize / 2);
                }
                if (player.view == board.sides[1].name)
                    rotate(PI);

                text(`${y}`, 0, 0);
                pop();
            }
            if (y == 1 || y == 8) {
                push();
                switch (y) {
                    case 1:
                        translate(0, squareSize * 1.5);
                    case 8:
                        translate(squareSize / 2, -squareSize / 4);
                }
                if (player.view == board.sides[1].name)
                    rotate(PI);

                text(`${colChar(x)}`, 0, 0);
                pop();
            }
            pop();
        })

        push();
        if (player.view == board.sides[1].name) {
            translate(boardSize, boardSize);
            rotate(PI);
        }
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        fill(board.sides[0].color);
        textSize(!mobile ? 18 : 14);
        text(loadedGame.name, boardSize / 2, -marginY / 1.25);
        textSize(!mobile ? 14 : 10);
        text(`Current turn: ${board.turn.name}`, boardSize / 2, -marginY / 2);

        let statusIconSize = 16;
        let circleSize = 12;
        setupChessGlyphStyle(statusIconSize);

        text(glyphs.chess.general, -marginX / 1.5, -marginY / 1.5);
        strokeWeight(1.5);
        if (activity[board.sides[0].name]) {
            fill(colors.green);
            stroke(colors.green);
        } else {
            fill(bg);
            stroke(255, 255, 255, 100);
        }
        circle(-marginX / 1.5 + circleSize * 1.75, -marginY / 1.5 + circleSize / 4, circleSize);

        fill(board.sides[1].color);
        stroke(board.sides[0].color);
        text(glyphs.chess.general, -marginX / 1.5, -marginY / 1.5 + statusIconSize * 1.5);
        if (activity[board.sides[1].name]) {
            fill(colors.green);
            stroke(colors.green);
        } else {
            fill(bg);
            stroke(255, 255, 255, 100);
        }
        circle(-marginX / 1.5 + circleSize * 1.75, -marginY / 1.5 + circleSize / 4 + statusIconSize * 1.5, circleSize);



        pop();

        // Draw Borders
        strokeWeight(1);
        noFill();
        stroke(board.sides[0].color);
        rect(0, 0, boardSize, boardSize);
        rect(-marginX, -marginY, boardSize + marginX * 2, boardSize + marginY * 2);
    }

    drawPieces() {
        for (let x of board.state)
            for (let piece of x)
                if (piece)
                    piece.draw();

    }

    addSide(side) {
        this.sides.push(side);

        if (side == this.sides[1]) {
            // When there are two sides, run the following
            this.sides[0].createEnemy(this.sides[1]);
            this.sides[1].createEnemy(this.sides[0]);
            this.turn = this.sides[0];

            colors.white = this.sides[0].color;
            colors.black = this.sides[1].color;
            let gray = middleColor(colors.white, colors.black);
            colors.gray = gray;

            bg = colors.black;
        }

    }


    checkPositionIsOccupied(x, y) {
        if (x < 0 || x > 7 || y < 0 || y > 7)
            return false
        else return board.state[x][y];
    }

    updateData(data) {
        for (let [key, value] of Object.entries(data))
            switch (key) {
                case "state":
                    this[key] = [];
                    for (let [index, array] of Object.entries(value)) {
                        this[key].push([]);
                        for (let i = 0; i < array.length; i++) {
                            if (array[i])
                                switch (array[i].type) {
                                    case INFANTRY:
                                        this[key][index].push(new Infantry(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;

                                    case ARTILLERY:
                                        this[key][index].push(new Artillery(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;

                                    case PARATROOPER:
                                        this[key][index].push(new Paratrooper(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;

                                    case SNIPER:
                                        this[key][index].push(new Sniper(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;

                                    case TANK:
                                        this[key][index].push(new Tank(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;

                                    case GENERAL:
                                        this[key][index].push(new General(array[i].side, array[i].position.x, array[i].position.y, array[i].moves, array[i].moved, array[i].hp, array[i].cooldown, array[i].potentialAttackers));
                                        break;

                                    default:
                                        this[key][index].push(new Piece(array[i].type, array[i].side, array[i].position.x, array[i].moves, array[i].position.y, array[i].moved, array[i].hp, array[i].cooldown));
                                        break;
                                }
                            else
                                this[key][index].push(Null)
                        }
                    }
                    break;

                default:
                    this[key] = value;
                    break;
            }
        if (!board.active)
            player.side = null;

        // // set check
        // for (let general of getPiecesOfType(GENERAL)) {
        //     if (general.hp == 1)
        //         general.checkLoop();
        // }

        if (board.check)
            checkBreakers = [];

        let isWhiteAlive = false, isBlackAlive = false;
        pieceLoop(piece => {
            // call getMoves() for every piece
            if (board.turn.name == piece.side.name) {
                piece.getMoves();

                // if (board.check == piece.getGeneral())
                //     piece.getCheckBreakingMoves();

                // if (!board.check)
                //     piece.blockCheckMoves()
            }

            if (!isWhiteAlive && piece.side.name == board.sides[0].name)
                isWhiteAlive = true;
            if (!isBlackAlive && piece.side.name == board.sides[0].name)
                isBlackAlive = true;
        });

        if (board.check && !checkBreakers.length) {
            checkMate = true;
        }


        if (!isWhiteAlive || !isBlackAlive)
            board.loss = !isWhiteAlive ? board.sides[0] : board.sides[1];
    }

}