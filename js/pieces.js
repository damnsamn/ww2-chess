class Pawn extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false, enPassant = false) {
        super(PAWN, side, gridX, gridY, moves, moved);
        this.enPassant = enPassant;
    }

    getMoves() {
        this.yDir = board.sides[0].name == this.side.name ? 1 : -1;
        this.yStep = this.position.index.y + this.yDir;


        this.moves = [];
        let target, path;
        // Forward
        target = board.checkPositionIsOccupied(this.position.index.x, this.yStep);
        if (!target)
            this.addMove(this.position.index.x, this.yStep);

        // Two-step
        target = board.checkPositionIsOccupied(this.position.index.x, this.yStep + this.yDir);
        path = board.checkPositionIsOccupied(this.position.index.x, this.yStep);
        if (!this.moved && !path && !target)
            this.addMove(this.position.index.x, this.yStep + this.yDir);

        // Capture Left
        target = board.checkPositionIsOccupied(this.position.index.x - 1, this.yStep);
        if (target && target.side.name != this.side.name)
            this.addMove(this.position.index.x - 1, this.yStep);

        // Capture Right
        target = board.checkPositionIsOccupied(this.position.index.x + 1, this.yStep);
        if (target && target.side.name != this.side.name)
            this.addMove(this.position.index.x + 1, this.yStep);

        // En Passant Left
        target = board.checkPositionIsOccupied(this.position.index.x - 1, this.yStep);
        path = board.checkPositionIsOccupied(this.position.index.x - 1, this.position.index.y);
        if (!target &&
            path &&
            path.side.name != this.side.name &&
            path.type == PAWN &&
            path.enPassant)
            this.addMove(this.position.index.x - 1, this.yStep, path)

        // En Passant Right
        target = board.checkPositionIsOccupied(this.position.index.x + 1, this.yStep);
        path = board.checkPositionIsOccupied(this.position.index.x + 1, this.position.index.y);
        if (!target &&
            path &&
            path.side.name != this.side.name &&
            path.type == PAWN &&
            path.enPassant)
            this.addMove(this.position.index.x + 1, this.yStep, path)
    }

    setEnPassant(x, y) {
        boardLoop((x, y) => {
            if (board.state[x - 1][y - 1].enPassant)
                board.state[x - 1][y - 1].enPassant = false;
        })
        if (x == this.position.index.x && y == this.yStep + this.yDir) {
            this.enPassant = true;
        }
    }


}

class Rook extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false) {
        super(ROOK, side, gridX, gridY, moves, moved);
    }

    getMoves() {
        this.moves = [];


        for (let x = -1; x <= 1; x++)
            if (x != 0)
                this.moveLoop(x, 0);
            else
                for (let y = -1; y <= 1; y += 2)
                    this.moveLoop(x, y);



        if (!this.moved) {
            let castling = this.getCastling(this.getKing());
            if (castling)
                this.addMove(castling.x, castling.y, CASTLING);
        }

    }
}

class Knight extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false) {
        super(KNIGHT, side, gridX, gridY, moves, moved);
    }

    getMoves() {
        this.moves = [];

        for (let x = -2; x <= 2; x++)
            if (x != 0)
                if (x % 2 == 0) {
                    for (let y = -1; y <= 1; y++)
                        if (y != 0)
                            this.moveLoop(x, y, 1);
                }
                else
                    for (let y = -2; y <= 2; y++)
                        if (y % 2 == 0 && y != -0)
                            this.moveLoop(x, y, 1);

    }
}

class Bishop extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false) {
        super(BISHOP, side, gridX, gridY, moves, moved);
    }

    getMoves() {
        this.moves = [];

        for (let x = -1; x <= 1; x += 2)
            for (let y = -1; y <= 1; y += 2)
                this.moveLoop(x, y);
    }
}

class Queen extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false) {
        super(QUEEN, side, gridX, gridY, moves, moved);
    }

    getMoves() {
        this.moves = [];

        for (let x = -1; x <= 1; x++)
            for (let y = -1; y <= 1; y++)
                this.moveLoop(x, y);
    }
}

class King extends Piece {
    constructor(side, gridX, gridY, moves = [], moved = false, potentialAttackers = []) {
        super(KING, side, gridX, gridY, moves, moved);
        this.potentialAttackers = potentialAttackers;
    }

    getMoves() {
        this.moves = [];

        for (let x = -1; x <= 1; x++)
            for (let y = -1; y <= 1; y++)
                this.moveLoop(x, y, 1);

        if (!this.moved)
            for (let x of [0, 7]) {
                let piece = board.state[x][this.position.index.y];
                if (piece && piece.type == ROOK) {
                    let castling = this.getCastling(piece);
                    if (castling)
                        this.addMove(castling.x, castling.y, CASTLING);
                }
            }


        this.checkLoop();
    }

    checkLoop() {
        this.getPotentialAttackers();


        this.checkedBy = [];
        for (let piece of this.potentialAttackers) {
            piece.getMoves();
            for (let move of piece.moves)
                if (move.x == this.position.index.x && move.y == this.position.index.y)
                    this.checkedBy.push(piece);
        }

        // Perform checkLoop() for each King
        let check = Null;
        for (let king of getPiecesOfType(KING)) {
            if (king.checkedBy && king.checkedBy.length)
                check = king;
        }
        board.check = check;

    }

    getCheckAt(x, y) {

        let mockMove = this.beginMove(x, y);
        let oldCheck = board.check;
        this.checkLoop();
        let newCheck = board.check;
        board.check = oldCheck;
        this.revertMove(mockMove.original, mockMove.destination);

        if (newCheck)
            return true;
        else
            return false;
    }

    getPotentialAttackers() {
        this.potentialAttackers = [];

        // Cardinal & ordinal directions
        for (let x = -1; x <= 1; x++)
            for (let y = -1; y <= 1; y++) {
                // console.log(`checking: ${x}, ${y}`)
                this.loopIncrementAttackers(x, y);
            }


        // Knight
        for (let x = -2; x <= 2; x++)
            if (x != 0)
                if (x % 2 == 0) {
                    for (let y = -1; y <= 1; y++)
                        if (y != 0)
                            this.loopIncrementAttackers(x, y, 1);
                }
                else
                    for (let y = -2; y <= 2; y++)
                        if (y % 2 == 0 && y != -0)
                            this.loopIncrementAttackers(x, y, 1);

    }

    loopIncrementAttackers(x, y, n = 0) {
        this.loopIncrement(x, y, (posX, posY) => {
            let statePos = board.state[posX][posY];
            if (statePos != Null && statePos.side.name != this.side.name && statePos.type != this.type)
                this.potentialAttackers.push(statePos);
        }, n)
    }

}