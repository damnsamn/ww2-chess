class Side {
    constructor(name, c) {
        this.name = name;
        this.color = c;
        this.active = Null;
        this.graveyard = Null;
        this.totalPieces = 0;
    }

    definePieces(array) {
        board.addSide(this);
        activity[this.name] = false;

        // let pieces = Object.values(obj)
        for (let piece of array) {
            board.state[piece.position.index.x][piece.position.index.y] = piece;
            this.totalPieces++;
        }
    }

    createEnemy(side) {
        this.enemy = {
            name: side.name,
            color: side.color
        }
    }

    static generalDeath(side) {
        pieceLoop(piece => {
            if (piece.side.name == side.name) {
                piece.hp = 1;
            }
        });

        side.generalKIA = null;
        console.log("sending data:");
        console.log(board);
        boardData.set(board);
    }
}