class Button {
    constructor(drawFunction) {
        this.drawFunction = drawFunction;
    }

    catchClick(func) {
        if (this.hover()) {
            func();
        }
    }

    draw(x, y, width, height = width, debug = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        push();
        translate(this.x, this.y);
        this.drawFunction(0, 0, this);
        if (debug) {
            stroke(255, 0, 0);
            strokeWeight(1);
            noFill();
            rect(0, 0, this.width, this.height);
        }
        pop();

        if (this.hover())
            cursor("pointer");
    }

    hover() {
        return (mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height);
    }
}

var buttons = {
    newGame: new Button((x, y, self) => {
        let labelSize = mobile ? 12 : 16;
        textSize(labelSize);
        fill(colors.blue);
        noStroke();
        textAlign(CENTER, CENTER);
        text("NEW GAME", self.width / 2, self.height / 2 - labelSize / 4);
    }),
    newGameConfirm: new Button((x, y, self) => {
        let labelSize = mobile ? 12 : 16;
        textSize(labelSize);
        noStroke();
        fill(darken(color(colors.blue), 0.8));
        rect(x, y, self.width, self.height, 3);
        fill(colors.white)
        textAlign(CENTER, CENTER);
        text("CONFIRM", self.width / 2, self.height / 2 - labelSize / 4);
    }),
    gameListRefresh: new Button((x, y, self) => {
        setupGlyphStyle(self.width);
        fill(colors.white);
        text(glyphs.refresh, self.width / 2, self.height / 2);
    }),
    selectWhite: new Button((x, y, self) => {
        setupGlyphStyle(squareSize);
        fill(colors.white);
        stroke(colors.black);
        text(glyphs.king, self.width / 2, self.height / 2);
    }),
    selectBlack: new Button((x, y, self) => {
        setupGlyphStyle(squareSize);
        fill(colors.black);
        stroke(colors.white);
        text(glyphs.king, self.width / 2, self.height / 2);
    }),
    endGame: new Button((x, y, self) => {
        textSize(mobile ? 12 : 16);
        noStroke();
        fill(colors.red);
        rect(x, y, self.width, self.height, 3);
        fill(colors.white)
        textAlign(CENTER, CENTER);
        text("END GAME", self.width / 2, self.height / 2 - 16 / 4);
    }),
    resetBoard: new Button((x, y, self) => {
        textSize(mobile ? 12 : 16);
        fill(colors.red);
        noStroke();
        textAlign(CENTER, CENTER);
        text("RESET BOARD", self.width / 2, self.height / 2 - 16 / 4);
    }),
    promote: {
        queen: new Button((x, y, self) => {
            setupGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.queen, self.width / 2, self.height / 2);
        }),
        rook: new Button((x, y, self) => {
            setupGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.rook, self.width / 2, self.height / 2);
        }),
        bishop: new Button((x, y, self) => {
            setupGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.bishop, self.width / 2, self.height / 2);
        }),
        knight: new Button((x, y, self) => {
            setupGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.knight, self.width / 2, self.height / 2);
        }),

    }
}