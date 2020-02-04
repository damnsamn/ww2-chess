class Piece {
    constructor(type, side, posX, posY, moves = [], moved = false) {
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
        this.moves = moves;
        this.moved = moved;
    }

    draw() {
        let fillColor = color(this.side.color || "#ff0000");
        let strokeColor = color(this.side.enemy ? this.side.enemy.color : "#ff0000");
        push();
        setupGlyphStyle();

        translate((this.position.index.x) * squareSize, (8 - this.position.index.y - 1) * squareSize);
        if (player.view == board.sides[1].name) {
            translate(squareSize, squareSize);
            rotate(PI);
        }

        stroke(player.selectedPiece == this ? darken(colors.blue, 0.75) : strokeColor);
        fill(fillColor);
        text(this.glyph, squareSize / 2, squareSize / 2 - iconSize / 8);
        pop();
    }

    showAvailableMoves() {

        if (this.moves) {
            let moves = Object.values(this.moves)
            for (let move of moves) {
                let piece = board.state[move.x][move.y];
                let c = piece == Null ? color(colors.blue) : piece.side.name == this.side.name ? color(colors.green) : color(colors.red);
                push();
                translate(move.x * squareSize, (8 - move.y - 1) * squareSize);

                noStroke();
                c.setAlpha(150)
                fill(c)
                circle(squareSize / 2, squareSize / 2, 20);
                pop();

                // console.log(`x: ${x}, y: ${y}, ${moves}`)

            }
        }
    }

    addMove(row, col, param = null) {
        this.moves.push({ x: row, y: col, param: param });
    }


    getMoves() {

    }

    getKing() {
        for (let king of getPiecesOfType(KING))
            if (king.side.name == this.side.name)
                return king;
    }

    getCheckBreakingMoves() {
        let availableMoves = this.moves;

        this.moves = [];
        let currentCheck = board.check;
        for (let move of availableMoves) {
            if (move.param == CASTLING)
                continue;
            let mockMove = this.beginMove(move.x, move.y);

            this.getKing().checkLoop();

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

            if (This.moves[i].param == CASTLING) {
                i++;
            } else {
                let mockMove = This.beginMove(This.moves[i]);
                let currentCheck = board.check;

                This.getKing().checkLoop();

                if (board.check)
                    This.moves.splice(i, 1);
                else
                    i++;

                board.check = currentCheck;
                This.revertMove(mockMove.original, mockMove.destination);
            }

            if (i != This.moves.length)
                loop(i);
        }

        if (this.moves.length)
            loop(i);
    }

    beginMove(move, y = null) {
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

        // Check col,row correspond to an existing move in this.moves
        for (let move of moves) {
            if (col - 1 == move.x && row - 1 == move.y) {

                if (move.param == CASTLING) {
                    this.doCastling(board.state[move.x][move.y]);

                } else {
                    let mockMove = this.beginMove(move.x, move.y);

                    if (this.type == PAWN)
                        this.setEnPassant(move.x, move.y);

                    if (move.param instanceof Piece) {
                        let piece = move.param;
                        this.grave(piece.type);
                        board.state[piece.position.index.x][piece.position.index.y] = Null;
                    }

                    this.commitMove(mockMove.original, mockMove.destination);
                }
            }
        }
    }

    commitMove(original, destination) {
        // board.state[this.position.index.x][this.position.index.y] = this;

        // Add lastMove ghost
        board.lastMove = [{ x: original.x, y: original.y }];

        this.moved = true;

        // show *which* piece last moved
        board.lastMove.push({ x: this.position.index.x, y: this.position.index.y });

        if (this.type == PAWN)
            if ((this.side.name == board.sides[0].name && this.position.y == 8) || (this.side.name == board.sides[1].name && this.position.y == 1))
                promotion = this;


        if (!promotion) {
            // Deselect on move
            player.selectedPiece = Null;

            if (board.isFirstMove)
                board.isFirstMove = false;

            if (destination.piece != Null)
                this.grave(destination.piece.type);

            // Change turn
            board.turn = this.side.enemy;

            console.log("sending data:")
            console.log(board)
            boardData.set(board);
        }

    }

    loopIncrement(incrementX, incrementY, loopFunction, n = 0) {
        let newX = this.position.index.x + incrementX;
        let newY = this.position.index.y + incrementY;

        // if n, only loop n times - else loop until we hit array bounds
        for (let i = 0; n != 0 ? i < n : i < board.state.length; i++)
            if (newX >= 0 && newX < board.state.length && newY >= 0 && newY < board.state.length) {
                let newPos = board.state[newX][newY];

                if (newPos === Null && newPos !== undefined) {
                    loopFunction(newX, newY);
                    newX += incrementX;
                    newY += incrementY;
                } else if (newPos && newPos.side.name != this.side.name) {
                    loopFunction(newX, newY);
                    break;
                }
            }
    }

    moveLoop(incrementX, incrementY, n) {
        this.loopIncrement(
            incrementX,
            incrementY,
            (x, y) => {
                this.addMove(x, y);
            }, n);
    }

    grave(pieceType) {
        let side = board.sides[0].name == this.side.name ? board.sides[0] : board.sides[1];
        if (!side.graveyard)
            side.graveyard = [];

        side.graveyard.push(pieceType);
    }

    getCastling(target) {
        let king = this.type == KING ? this : target;
        let rook = this.type == ROOK ? this : target;

        if (king.side.name == rook.side.name && !king.moved && !rook.moved && board.check != king) {
            let diffX = rook.position.x - king.position.x;
            let inc = diffX / abs(diffX);

            let legal = true;
            for (let x = king.position.index.x + inc; x != rook.position.index.x; x += inc) {
                if (king.getCheckAt(x, king.position.index.y) || getPieceAtCoordinate(x + 1, king.position.index.y + 1))
                    legal = false;
            }

            if (legal) {
                return { x: target.position.index.x, y: target.position.index.y }
            }
            else return false;
        }
        else return false;
    }

    doCastling(target) {
        let king = this.type == KING ? this : target;
        let rook = this.type == ROOK ? this : target;
        let diffX = rook.position.x - king.position.x;
        let inc = diffX / abs(diffX);

        let kingMove = king.beginMove(king.position.index.x + inc * (abs(diffX) - 1), king.position.index.y);
        let rookMove = rook.beginMove(rook.position.index.x - inc * (abs(diffX) - 1), rook.position.index.y);

        board.lastMove = [];
        board.lastMove.push({ x: kingMove.original.x, y: kingMove.original.y })
        board.lastMove.push({ x: rookMove.original.x, y: rookMove.original.y })
        board.lastMove.push({ x: kingMove.destination.x, y: kingMove.destination.y })
        board.lastMove.push({ x: rookMove.destination.x, y: rookMove.destination.y })

        king.moved = false;
        rook.moved = true;

        // Deselect on move
        player.selectedPiece = Null;

        // Change turn
        board.turn = this.side.enemy;

        if (board.isFirstMove)
            board.isFirstMove = false;

        console.log("sending data:")
        console.log(board)
        boardData.set(board);
    }
}