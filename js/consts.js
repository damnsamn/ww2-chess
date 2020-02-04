// Coordinates
const A = 1;
const B = 2;
const C = 3;
const D = 4;
const E = 5;
const F = 6;
const G = 7;
const H = 8;

const Null = "";

// Global Constants
const mobile = window.innerWidth < 800;
const w = mobile ? window.innerWidth : 800;
const h = mobile ? w : 800;
const boardSize = w * 0.75;
const marginX = (w - boardSize) / 2;
const marginY = (h - boardSize) / 2;
const squareSize = boardSize / 8;
const iconFontPath = 'assets/fa-solid-900.ttf';
const textFontPath = 'assets/RobotoMono-Bold.ttf';
const iconSize = squareSize / 1.5;

// Type strings
const PAWN = "PAWN";
const ROOK = "ROOK";
const KNIGHT = "KNIGHT";
const BISHOP = "BISHOP";
const QUEEN = "QUEEN";
const KING = "KING";

const CASTLING = "CASTLING";

// Glyphs object
const glyphs = {
    pawn: "\u{F443}",
    rook: "\u{F447}",
    knight: "\u{F441}",
    bishop: "\u{F43A}",
    queen: "\u{F445}",
    king: "\u{F43F}",
    refresh: "\u{F2F1}"
}