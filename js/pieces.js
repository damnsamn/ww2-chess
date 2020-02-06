class Infantry extends Piece {
    constructor(side, gridX, gridY, moves = null, moved = false, hp = 2, ) {
        super(INFANTRY, side, gridX, gridY, moves, moved, hp);
    }

    getMoves() {
        this.initMoves();
        this.yStep = this.position.index.y + this.yDir;
        let target;

        // Movement
        // Forward and back
        for (let y = -1; y <= 1; y += 2) {
            target = board.checkPositionIsOccupied(this.position.index.x, this.position.index.y + y);
            if (!target)
                this.addMove(MOVEMENT, this.position.index.x, this.position.index.y + y);
        }

        // Ranged
        target = board.checkPositionIsOccupied(this.position.index.x, this.position.index.y + this.yDir * 2);
        let path = board.checkPositionIsOccupied(this.position.index.x, this.position.index.y + this.yDir)
        if (target && !path && target.side.name != this.side.name)
            this.addMove(RANGED, target.position.index.x, target.position.index.y)

        // Melee
        for (let x = -1; x <= 1; x++) {
            target = board.checkPositionIsOccupied(this.position.index.x + x, this.position.index.y + this.yDir);
            if (target && target.side.name != this.side.name)
                this.addMove(MELEE, target.position.index.x, target.position.index.y);
        }
    }


}

class Artillery extends Piece {
    constructor(side, gridX, gridY, moves = {}, moved = false, hp = 2) {
        super(ARTILLERY, side, gridX, gridY, moves, moved, hp);
    }

    getMoves() {
        // this.moves = {};


        // for (let x = -1; x <= 1; x++)
        //     if (x != 0)
        //         this.moveLoop(x, 0);
        //     else
        //         for (let y = -1; y <= 1; y += 2)
        //             this.moveLoop(x, y);

    }
}

class Paratrooper extends Piece {
    constructor(side, gridX, gridY, moves = {}, moved = false, hp = 2) {
        super(PARATROOPER, side, gridX, gridY, moves, moved, hp);
    }

    getMoves() {
        // this.moves = {};

        // for (let x = -2; x <= 2; x++)
        //     if (x != 0)
        //         if (x % 2 == 0) {
        //             for (let y = -1; y <= 1; y++)
        //                 if (y != 0)
        //                     this.moveLoop(x, y, 1);
        //         }
        //         else
        //             for (let y = -2; y <= 2; y++)
        //                 if (y % 2 == 0 && y != -0)
        //                     this.moveLoop(x, y, 1);

    }
}

class Sniper extends Piece {
    constructor(side, gridX, gridY, moves = {}, moved = false, hp = 2) {
        super(SNIPER, side, gridX, gridY, moves, moved, hp);
    }

    getMoves() {
        // this.moves = {};

        // for (let x = -1; x <= 1; x += 2)
        //     for (let y = -1; y <= 1; y += 2)
        //         this.moveLoop(x, y);
    }
}

class Tank extends Piece {
    constructor(side, gridX, gridY, moves = {}, moved = false, hp = 2) {
        super(TANK, side, gridX, gridY, moves, moved, hp);
    }

    getMoves() {
        // this.moves = {};

        // for (let x = -1; x <= 1; x++)
        //     for (let y = -1; y <= 1; y++)
        //         this.moveLoop(x, y);
    }
}

class General extends Piece {
    constructor(side, gridX, gridY, moves = {}, moved = false, hp = 2, potentialAttackers = []) {
        super(GENERAL, side, gridX, gridY, moves, moved, hp);
        this.potentialAttackers = potentialAttackers;
    }

    getMoves() {
        // this.moves = {};

        // for (let x = -1; x <= 1; x++)
        //     for (let y = -1; y <= 1; y++)
        //         this.moveLoop(x, y, 1);

        // this.checkLoop();
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

        // Perform checkLoop() for each General
        let check = Null;
        for (let general of getPiecesOfType(GENERAL)) {
            if (general.checkedBy && general.checkedBy.length)
                check = general;
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


        // Paratrooper
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