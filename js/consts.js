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
const chessIconFontPath = 'assets/ww2-chess.ttf';
const fontAwesomeFontPath = 'assets/fa-solid-900.ttf';
const textFontPath = 'assets/RobotoMono-Bold.ttf';
const iconSize = squareSize / 1.5;

// Type strings
const INFANTRY = "INFANTRY";
const ARTILLERY = "ARTILLERY";
const PARATROOPER = "PARATROOPER";
const SNIPER = "SNIPER";
const TANK = "TANK";
const GENERAL = "GENERAL";

// Move types
const MOVEMENT = "movement";
const RANGED = "ranged";
const SPLASH = "splash";
const MELEE = "melee";

// Glyphs object
const glyphs = {
    chess: {
        infantry: "\u{E900}",
        artillery: "\u{E901}",
        paratrooper: "\u{E902}",
        sniper: "\u{E903}",
        tank: "\u{E904}",
        general: "\u{E905}",
    },
    fa: {
        pawn: "\u{F443}",
        rook: "\u{F447}",
        knight: "\u{F441}",
        bishop: "\u{F43A}",
        queen: "\u{F445}",
        king: "\u{F43F}",
        infantry: "\u{F925}",
        artillery: "\u{F1E2}",
        paratrooper: "\u{F4CD}",
        sniper: "\u{F05B}",
        tank: "\u{F1B9}",
        general: "\u{F508}",
        footsteps: "\u{F54B}",
        crosshair: "\u{F05B}",
        swords: "\u{F71D}",
        refresh: "\u{F2F1}",
        cross: "\u{F00D}",
        target: "\u{F192}",
    }
}