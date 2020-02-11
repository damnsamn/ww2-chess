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
    newGameCancel: new Button((x, y, self) => {
        setupFontAwesomeGlyphStyle(self.width);
        fill(colors.white);
        text(glyphs.fa.cross, self.width / 2, self.height / 2);
    }),
    gameListRefresh: new Button((x, y, self) => {
        setupFontAwesomeGlyphStyle(self.width);
        fill(colors.white);
        text(glyphs.fa.refresh, self.width / 2, self.height / 2);
    }),
    selectWhite: new Button((x, y, self) => {
        setupChessGlyphStyle(squareSize);
        fill(colors.white);
        stroke(colors.black);
        text(glyphs.chess.general, self.width / 2, self.height / 2);
    }),
    selectBlack: new Button((x, y, self) => {
        setupChessGlyphStyle(squareSize);
        fill(colors.black);
        stroke(colors.white);
        text(glyphs.chess.general, self.width / 2, self.height / 2);
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
    retreat: new Button((x, y, self) => {
        textSize(mobile ? 12 : 16);
        noStroke();
        fill(colors.red);
        rect(x, y, self.width, self.height, 3);
        fill(colors.white)
        textAlign(CENTER, CENTER);
        text("RETREAT", self.width / 2, self.height / 2 - 16 / 4);
    }),
    keepFighting: new Button((x, y, self) => {
        textSize(mobile ? 12 : 16);
        noStroke();
        fill(colors.green);
        rect(x, y, self.width, self.height, 3);
        fill(colors.white)
        textAlign(CENTER, CENTER);
        text("KEEP FIGHTING", self.width / 2, self.height / 2 - 16 / 4);
    }),
    resetBoard: new Button((x, y, self) => {
        textSize(mobile ? 12 : 16);
        fill(colors.red);
        noStroke();
        textAlign(CENTER, CENTER);
        text("RESET BOARD", self.width / 2, self.height / 2 - 16 / 4);
    }),
    promote: {
        tank: new Button((x, y, self) => {
            setupChessGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.chess.tank, self.width / 2, self.height / 2);
        }),
        artillery: new Button((x, y, self) => {
            setupChessGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.chess.artillery, self.width / 2, self.height / 2);
        }),
        sniper: new Button((x, y, self) => {
            setupChessGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.chess.sniper, self.width / 2, self.height / 2);
        }),
        paratrooper: new Button((x, y, self) => {
            setupChessGlyphStyle(squareSize);
            fill(promotion.side.color);
            stroke(promotion.side.enemy.color);
            text(glyphs.chess.paratrooper, self.width / 2, self.height / 2);
        }),

    }
}