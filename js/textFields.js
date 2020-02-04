class TextField {

    constructor(label) {
        this.label = label;
        this.width = 0;
        this.value = "";
    }

    catchClick(func = null) {
        if (this.hover()) {
            fieldFocus = this;
            textInputEl.value = this.value;
            if (func)
                func(this);
        }
    }


    draw(x, y, width, debug = false) {
        this.x = x;
        this.y = y;

        this.fieldX = 0;
        this.fieldY = textSize() * 1.75;
        this.fieldW = width;
        this.fieldH = textSize() * 2;
        let valueSize = textSize() * 0.8;

        this.maxChars = round(this.fieldW / (valueSize * 0.6) - 3);

        let textBlink = fieldFocus == this && (frameCount % 60 < 30 || keyIsPressed) ? "_" : "";

        push();
        translate(x, y);
        let focusColor = color(fieldFocus == this ? colors.blue : 0);

        // Label
        textAlign(LEFT, TOP);
        text(this.label, 0, this.width);

        // Box
        translate(this.fieldX, this.fieldY)
        fill(255);
        stroke(lighten(focusColor, 0.4));
        strokeWeight(2);
        rect(0, 0, this.fieldW, this.fieldH, 3);

        // Value
        textAlign(LEFT, CENTER);
        textSize(valueSize);
        fill(darken(focusColor, 0.7));
        noStroke();
        text(this.value + textBlink, valueSize, this.fieldH / 2.25);


        pop();


        if (this.hover())
            cursor("text");

    }

    hover() {
        // console.log(`mouseX > this.x: ${round(mouseX)} > ${this.x}`);
        // console.log(`mouseX < this.x + this.fieldW: ${round(mouseX)} < ${this.x + this.fieldW}`);
        // console.log(`mouseY > this.y + this.fieldY: ${round(mouseY)} > ${this.y + this.fieldY}`);
        // console.log(`mouseY < this.y + this.fieldY + this.fieldH: ${round(mouseY)} < ${this.y + this.fieldY + this.fieldH}`);

        return (mouseX > this.x && mouseX < this.x + this.fieldW && mouseY > this.y + this.fieldY && mouseY < this.y + this.fieldY + this.fieldH);
    }

    input(e) {
        this.value = textInputEl.value;
        this.value = this.value.slice(0, this.maxChars);
        textInputEl.value = this.value;
    }
}

var textFields = {
    newGame: new TextField("Game Title"),
}