import "./style.css";
import Tetris from "./tetris/Tetris";
import { PieceType } from "./tetris/Piece";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;

const tetris = new Tetris(canvas);

const randomPiece = () => {
  const pieces: PieceType[] = ["O", "I", "S", "Z", "L", "J", "T"];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

let cur = tetris.spawn(randomPiece());

function goDown() {
  if (!cur.down()) {
    cur = tetris.spawn(randomPiece());
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
  if (e.key === "r") location.reload();
  if (e.key === " ") {
    for (let i = 0; i < tetris.height; i++) {
      cur.down();
    }
    cur = tetris.spawn(randomPiece());
  }
});