import "./style.css";
import Tetris from "./tetris/Tetris";
import Piece, { PieceType } from "./tetris/Piece";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;

const tetris = new Tetris(canvas);


let curCycle = tetris.cycle();
const nextPiece = () => curCycle.next().value!;
let cur: Piece<PieceType> = tetris.spawn(nextPiece());
let falling = false;
function goDown() {
  if (!cur) {
    falling = false;
    return;
  }
  falling = true;
  if (!cur.down()) {
    cur = tetris.spawn(nextPiece());
  }

  setTimeout(() => {
    goDown();
  }, 500 * (1 - tetris.level * 0.1));
}


addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("topScore") !== null) {
    goDown();
  }
  else {
    // Show the instructions
    showInstructions();
    localStorage.setItem("topScore", "0");
    location.reload();
  }
});

function showInstructions() {
  alert(`
Use the arrow keys or ASD to move the piece.
Use the space bar to drop the piece.
Use the W key or Arrow Up to rotate the piece 90 degrees.
          `.trim());
}

addEventListener("keydown", (e) => {
  if (e.key === "i") showInstructions();
  if (e.key === "d" || e.key == "ArrowRight") cur.left();
  if (e.key === "a" || e.key == "ArrowLeft") cur.right();
  if (e.key === "s" || e.key == "ArrowDown") cur.down();
  if (e.key === "w" || e.key == "ArrowUp") cur.rotate();
  if (e.key === "r") restart();
  if (e.key === " ") {
    for (let i = 0; i < tetris.height; i++) {
      cur.down();
    }
    cur = tetris.spawn(nextPiece());
  }
});

// Phone controls

let touchEvent: TouchEvent | null;
let touch: Touch | null;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchEvent = e;
  touch = e.touches[0];
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  // If triple tap, restart
  if (e.touches.length == 3) {
    restart();
    return;
  } 
  
  const diffTouch = e.changedTouches[0];
  const x = diffTouch.clientX - touch!.clientX;
  const y = diffTouch.clientY - touch!.clientY;
  const toUse = Math.abs(x) > Math.abs(y) ? "x" : "y";
  const useX = toUse == "x";
  const useY = toUse == "y";

  // Hold for 1 seconds to fullscreen
  console.log(e.timeStamp - touchEvent!.timeStamp);
  if (e.timeStamp - touchEvent!.timeStamp > 1000) {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen({
        navigationUI: "hide"
      });
    } else {
      document.exitFullscreen();
    }
  }
  else if (x == y) {
    cur.rotate();
  }
  else if (useX) {
    if (x >= 0) {
      cur.left();
    } else {
      cur.right();
    }
  }
  else if (useY) {
    if (y >= 0) {
      cur.down();
    }
    else if (y <= 0) {
      for (let i = 0; i < tetris.height; i++) {
        cur.down();
      }
      cur = tetris.spawn(nextPiece());
    }
  }

  touchEvent = null;
  touch = null;
});

function restart() {
  tetris.restart();
  curCycle = tetris.cycle();
  cur = tetris.spawn(nextPiece());

  if (!falling) {
    goDown();
  }
}