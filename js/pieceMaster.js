class Piece {
    moves = {
        movement: [],
        ranged: [],
        melee: []
    }

    constructor(type, side, posX, posY, moves = null, moved = false, hp = 2, cooldown = null) {
        this.type = type;
        this.side = side;
        this.position = {
            x: posX,
            y: posY,
            index: {
                x: posX - 1,
                y: posY - 1
            }
        }
        this.glyph = setGlyph(this.type);
        this.hp = hp;
        if (cooldown)
            this.cooldown = cooldown;
        else
            this.cooldown = {
                current: 0,
                max: 0,
                hp: {
                    original: hp,
                    temp: 1
                }
            }

        if (moves)
            this.moves = moves;
        else
            this.initMovesObj();

        this.moved = moved;
        this.yDir = this.side.name == "White" ? 1 : -1;
    }

    draw() {
        let fillColor = color(this.side.color || "#ff0000");
        let strokeColor = color(this.side.enemy ? this.side.enemy.color : "#ff0000");
        push();
        setupChessGlyphStyle();

        translate((this.position.index.x) * squareSize, (8 - this.position.index.y - 1) * squareSize);
        if (player.view == board.sides[1].name) {
            translate(squareSize, squareSize);
            rotate(PI);
        }

        // Draw Icon
        stroke(player.selectedPiece == this ? darken(colors.blue, 0.75) : strokeColor);
        fill(fillColor);
        text(this.glyph, squareSize / 2, squareSize / 2 - iconSize / 8);

        if (this.cooldown.current) {
            noStroke();
            let c = color(colors.black);
            c.setAlpha(200);
            fill(c);
            square(0, 0, squareSize);
            c = color(colors.white);
            c.setAlpha(200);
            fill(c)
            arc(squareSize / 2, squareSize / 2, squareSize / 2, squareSize / 2, 0, (TWO_PI / (this.cooldown.max * 2)) * this.cooldown.current, PIE);
        }


        // Draw HP
        strokeWeight(1);
        let c = this.hp < 2 ? colors.red : colors.green;
        stroke(lighten(color(c), 0.25));
        fill(c);
        if (this.hp > 0)
            circle(squareSize - 5 - 3, squareSize - 5 - 3, 5);
        if (this.hp > 1)
            circle(squareSize - 15 - 3, squareSize - 5 - 3, 5);
        else if (this.cooldown.current && this.cooldown.hp.original > this.hp) {
            fill(colors.gray);
            stroke(colors.gray);
            circle(squareSize - 15 - 3, squareSize - 5 - 3, 5);

        }

        pop();
    }

    initMovesObj() {
        this.moves = {
            movement: [],
            ranged: [],
            melee: []
        }
    }

    addMove(type, row, col, cooldown = false) {
        this.moves[type].push({ x: row, y: col, cooldown: cooldown });
    }

    getMoves() {

    }

    loopMovesOfType(moveType, func) {
        for (let move of this.moves[moveType]) {
            func(move);
        }
    }

    loopAllMoves(func) {
        let moveTypes = Object.keys(this.moves);
        for (let type of moveTypes)
            this.loopMovesOfType(type, move => func(move, type));
    }

    drawLoopMovesOfType(moveType, glyphColor, glyph, size, isDirectional = false) {
        this.loopMovesOfType(moveType, (move) => {

            push();
            translate(move.x * squareSize + squareSize / 2, (8 - move.y - 1) * squareSize + squareSize / 2);

            if (isDirectional) {
                // Rotate by direction
                if (move.x < this.position.index.x) {
                    if (move.y == this.position.index.y)
                        rotate(PI)
                    else if (move.y < this.position.index.y)
                        rotate(PI - PI / 4)
                    else
                        rotate(PI + PI / 4)
                } else if (move.x == this.position.index.x) {
                    if (move.y > this.position.index.y)
                        rotate(-PI / 2)
                    else
                        rotate(PI / 2)
                } else if (move.x > this.position.index.x) {
                    if (move.y < this.position.index.y)
                        rotate(PI / 4)
                    else if (move.y > this.position.index.y)
                        rotate(-PI / 4)
                }
            }
            else if (player.view == board.sides[1].name)
                rotate(PI);

            glyphColor.setAlpha(175);
            fill(glyphColor);
            setupFontAwesomeGlyphStyle(size);
            noStroke();
            if (board.state[move.x][move.y]) {
                stroke(lighten(glyphColor, 0.25))
                strokeWeight(2);
            }

            let g = glyph;
            if (this.type == PARATROOPER && moveType == MOVEMENT &&
                ((move.x < this.position.index.x - 1 || move.x > this.position.index.x + 1) ||
                    (move.y < this.position.index.y - 1 || move.y > this.position.index.y + 1))) {
                g = glyphs.fa.target;
                glyphColor.setAlpha(75)
                fill(glyphColor)
            }
            text(g, 0, 0);
            pop();
        })
    }

    showAvailableMoves() {

        if (this.moves) {

            this.drawLoopMovesOfType(MOVEMENT, darken(color(colors.blue), 0.75), glyphs.fa.footsteps, iconSize * 0.5, true);
            this.drawLoopMovesOfType(RANGED, color(colors.red), glyphs.fa.crosshair, iconSize * 0.8);
            this.drawLoopMovesOfType(MELEE, color(colors.red), glyphs.fa.swords, iconSize * 0.8);

        }
    }

    tryMoveAt(x, y) {
        let possibleMoves = [];

        this.loopAllMoves((move, type) => {
            if (x == move.x && y == move.y) {
                move.type = type;
                possibleMoves.push(move);
            }
        });

        if (possibleMoves.length) {
            if (possibleMoves.length == 1) {
                let move = possibleMoves[0];
                this.doMove(move);
            }
        }

    }

    doMove(move) {
        switch (move.type) {
            default:
                let mockMove = this.beginMovement(move.x, move.y);
                if (move.cooldown) {
                    this.startCooldown();
                }
                this.commitMovement(mockMove.original, mockMove.destination);
                break;
            case RANGED:
                console.log(`RANGED attack position [${colChar(move.x + 1)}, ${colChar(move.y + 1)}]`);
                if (this.type != ARTILLERY) {
                    board.state[move.x][move.y].damage(1);

                    board.lastMove = [{ x: this.position.index.x, y: this.position.index.y, color: colors.blue }];
                    board.lastMove.push({ x: move.x, y: move.y, color: colors.red });
                } else {
                    board.lastMove = [{ x: this.position.index.x, y: this.position.index.y, color: colors.blue }];

                    for (let x = -1; x <= 1; x++) {
                        if (board.state[move.x + x] && board.state[move.x + x][move.y])
                            board.state[move.x + x][move.y].damage(1);
                        board.lastMove.push({ x: move.x + x, y: move.y, color: colors.red });

                    }
                    for (let y = -1; y <= 1; y += 2) {
                        if (board.state[move.x][move.y + y])
                            board.state[move.x][move.y + y].damage(1);
                        board.lastMove.push({ x: move.x, y: move.y + y, color: colors.red });
                    }
                }
                if (move.cooldown) {
                    this.startCooldown();
                }

                this.endMove();

                break;
        }
    }


    damage(n) {
        this.hp -= n;

        if (this.hp < 1) {
            Piece.grave(this);
            board.state[this.position.index.x][this.position.index.y] = Null;

            // General KIA
            if (this.type == GENERAL) {
                let generalSide = this.side.name == board.sides[0].name ? board.sides[0] : board.sides[1];
                generalSide.generalKIA = true;
            }
        }

    }

    startCooldown() {
        if (this.cooldown.max) {
            this.cooldown.current = this.cooldown.max * 2;
            this.cooldown.hp.original = this.hp;
            this.hp = this.cooldown.hp.temp;
        }
    }

    getGeneral() {
        for (let general of getPiecesOfType(GENERAL))
            if (general.side.name == this.side.name)
                return general;
    }

    getCheckBreakingMoves() {
        let availableMoves = this.moves;

        this.moves = {};
        let currentCheck = board.check;
        for (let move of availableMoves) {
            let mockMove = this.beginMovement(move.x, move.y);

            this.getGeneral().checkLoop();

            if (board.check != currentCheck) {
                this.moves.push(move);
            }

            board.check = currentCheck;
            this.revertMove(mockMove.original, mockMove.destination);
        }

        if (this.moves.length)
            checkBreakers.push(this);
    }

    blockCheckMoves() {
        let i = 0;
        let This = this;

        function loop(i) {
            let mockMove = This.beginMovement(This.moves[i]);
            let currentCheck = board.check;

            This.getGeneral().checkLoop();

            if (board.check)
                This.moves.splice(i, 1);
            else
                i++;

            board.check = currentCheck;
            This.revertMove(mockMove.original, mockMove.destination);


            if (i != This.moves.length)
                loop(i);
        }

        if (this.moves.length)
            loop(i);
    }

    beginMovement(move, y = null) {
        if (typeof move == "object") {
            var x = move.x;
            y = move.y;
        } else if (typeof move == "number") {
            var x = move;
        }

        let This = this;
        let original = {
            piece: This,
            x: This.position.index.x,
            y: This.position.index.y
        };
        let destination = {
            piece: board.state[x][y],
            x: x,
            y: y
        };

        // Set current state position to Null
        board.state[this.position.index.x][this.position.index.y] = Null;

        // Change Piece's position coords
        this.position.x = x + 1;
        this.position.index.x = x;
        this.position.y = y + 1;
        this.position.index.y = y;

        // Change state destination to this
        board.state[this.position.index.x][this.position.index.y] = Null;
        board.state[this.position.index.x][this.position.index.y] = this;

        return {
            original: original,
            destination: destination
        }
    }

    revertMove(original, destination) {
        this.position.x = original.x + 1;
        this.position.index.x = original.x;
        this.position.y = original.y + 1;
        this.position.index.y = original.y;

        board.state[original.x][original.y] = original.piece;
        board.state[destination.x][destination.y] = destination.piece;
    }

    moveTo(col, row) {
        let moves = Object.values(this.moves);

        this.loopAllMoves((move, type) => {
            switch (type) {
                case MOVEMENT:
                    if (col - 1 == move.x && row - 1 == move.y) {
                        let mockMove = this.beginMovement(move.x, move.y);

                        this.commitMovement(mockMove.original, mockMove.destination);
                    }
                    break;
                case RANGED:
                    break;
                case MELEE:
                    break;
            }
        });

        // Check col,row correspond to an existing move in this.moves
        // for (let move of moves) {
        //     if (col - 1 == move.x && row - 1 == move.y) {
        //         let mockMove = this.beginMovement(move.x, move.y);

        //         this.commitMovement(mockMove.original, mockMove.destination);
        //     }
        // }
    }

    commitMovement(original, destination) {
        // TODO: Back to commitMove - shouldn't be able to shoot&kill enemy into own checkmate

        // Add lastMove ghost
        board.lastMove = [{ x: original.x, y: original.y, color: colors.blue }];

        // show *which* piece last moved
        board.lastMove.push({ x: this.position.index.x, y: this.position.index.y, color: destination.piece ? colors.red : colors.blue });

        this.moved = true;

        if (this.type == INFANTRY)
            if ((this.side.name == board.sides[0].name && this.position.y == 8) || (this.side.name == board.sides[1].name && this.position.y == 1))
                promotion = this;

        if (destination.piece != Null)
            Piece.grave(destination.piece);


        if (!promotion) {
            this.endMove();
        }
    }

    endMove() {
        // Deselect on move
        player.selectedPiece = Null;

        if (board.isFirstMove)
            board.isFirstMove = false;

        // Reduce all cooldowns for this side
        let skip = true;
        pieceLoop(piece => {
            if (piece != this && piece.cooldown.current) {
                piece.cooldown.current--;
                if (!piece.cooldown.current)
                    piece.hp = piece.cooldown.hp.original;
            }

            // Make sure there are enemy pieces without cooldown, else skip enemy player and have anothe turn
            if (piece.side.name == this.side.enemy.name && !piece.cooldown.current)
                skip = false;
        });
        // Change turn
        if (!skip)
            board.turn = this.side.enemy;

        console.log("sending data:")
        console.log(board)
        boardData.set(board);

    }

    loopIncrement(incrementX, incrementY, loopFunction, n = 0) {
        let newX = this.position.index.x + incrementX;
        let newY = this.position.index.y + incrementY;

        // if n, only loop n times - else loop until we hit array bounds
        for (let i = 0; n != 0 ? i < n : i < board.state.length; i++)
            if (newX >= 0 && newX < board.state.length && newY >= 0 && newY < board.state.length) {
                let dest = board.state[newX][newY];

                // If tile is empty
                if (dest === Null && dest !== undefined) {
                    loopFunction(newX, newY);
                    newX += incrementX;
                    newY += incrementY;

                    // Else if tile contains enemy
                } else if (dest && (dest.side.name != this.side.name || this.type == ARTILLERY)) {
                    loopFunction(newX, newY);
                    break;
                }
            }
    }

    moveLoop(type, incrementX, incrementY, cooldown = false, start = 0, n = 0) {
        let s = 0;
        this.loopIncrement(
            incrementX,
            incrementY,
            (x, y) => {
                if (s >= start) {
                    if ((type != MOVEMENT && board.state[x][y]) || (type == MOVEMENT && !board.state[x][y]) || type == SPLASH)
                        this.addMove(type == SPLASH ? RANGED : type, x, y, cooldown);
                } else s++;
            }, n);
    }

    attackLoop(type, incrementX, incrementY, cooldown = false, start = 0, n = 0) {
        this.loopIncrement(
            incrementX,
            incrementY,
            (x, y) => {
                if (board.state[x][y])
                    this.addMove(type, x, y, cooldown);
            });
    }

    static grave(piece) {
        let enemySide = board.sides[0].name == piece.side.enemy.name ? board.sides[0] : board.sides[1];
        if (!enemySide.graveyard)
            enemySide.graveyard = [];

        enemySide.graveyard.push(piece.type);
    }
}