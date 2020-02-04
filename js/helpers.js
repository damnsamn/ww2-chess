function colChar(int) {
    switch (int) {
        case 1: return "A";
        case 2: return "B";
        case 3: return "C";
        case 4: return "D";
        case 5: return "E";
        case 6: return "F";
        case 7: return "G";
        case 8: return "H";
    }
}

function createArray(len, itm) {
    var arr = [];
    while (len > 0) {
        arr.push(itm); len--;
    }
    return arr;
}

function darken(c, s) {
    s = constrain(s, 0, 1);
    let r = s * red(c);
    let g = s * green(c);
    let b = s * blue(c);

    return color(r, g, b);
}

function lighten(c, s) {
    s = constrain(s, 0, 1);
    let rDiff = 255 - red(c);
    let gDiff = 255 - green(c);
    let bDiff = 255 - blue(c);

    let r = red(c) + rDiff * s;
    let g = green(c) + gDiff * s;
    let b = blue(c) + bDiff * s;

    return color(r, g, b);
}