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

goDown();

addEventListener("keydown", (e) => {
  if (e.key === "d" || e.key == "ArrowRight") cur.left();
  if (e.key === "a" || e.key == "ArrowLeft") cur.right();
  if (e.key === "s" || e.key == "ArrowDown") cur.down();
  if (e.key === "r" || e.key == "ArrowUp") cur.rotate();
  if (e.key === " ") {
    for (let i = 0; i < tetris.height; i++) {
      cur.down();
    }
    cur = tetris.spawn(randomPiece());
  }
});