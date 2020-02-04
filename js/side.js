class Side {
    constructor(name, c) {
        this.name = name;
        this.color = c;
        this.active = Null;
        this.graveyard = Null;
    }

    definePieces(array) {
        board.addSide(this);
        activity[this.name] = false;

        // let pieces = Object.values(obj)
        for (let piece of array) {
            board.state[piece.position.index.x][piece.position.index.y] = piece;
        }
    }

    createEnemy(side) {
        this.enemy = {
            name: side.name,
            color: side.color
        }
    }
}