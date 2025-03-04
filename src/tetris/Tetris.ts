import Piece, { PieceType } from "./Piece";

export type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";
export type HexColor = `${HexDigit}${HexDigit}${HexDigit}` | string;

export default class Tetris {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public readonly width = 10
  public readonly height = 24
  public readonly screenHeight = 1080
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const width         = this.width,
          height        = this.height,
          screenHeight  = this.screenHeight;
    
    this.grid = new Array(height).fill(null).map(_ => new Array(width).fill(null))
    this.pieces = new Array(height).fill(null).map(_ => new Array(width).fill(null))
  
    this.canvas.width = screenHeight / height * width;
    this.canvas.height = screenHeight;

    this.blockWidth = this.canvas.width / width;
    this.blockHeight = this.canvas.height / height;

    console.log(this.blockWidth, this.blockHeight);
    
    this.ctx = this.canvas.getContext("2d")!;
    this.gameloop = this.gameloop.bind(this);
    this.gameloop();
  }

  private blockWidth: number;
  private blockHeight: number;

  private grid: (HexColor | null)[][];
  public getGrid(x: number, y: number) { {
    if (y < 0) return null;
    return this.grid[y]?.[x];
  } }
  public setGrid(x: number, y: number, color: HexColor | null) {
    if (
      x < 0
      ||  x > this.width
      ||  y < 0
      ||  y > this.height
    ) return;
    // debugger;
    if (this.grid[y]) this.grid[y][x] = color;
  }

  private pieces: Piece<PieceType>[][];
  
  private gameloop() {
    requestAnimationFrame(this.gameloop);
    
    const ctx = this.ctx;
    // ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.grid.length; y++) {
      const gridItem = this.grid[y];
      for (let x = 0; x < gridItem.length; x++) {
        const color = gridItem[x];
        if (!color) continue;

        // debugger;
        ctx.fillStyle = "#" + color;
        ctx.fillRect(x * this.blockWidth, y * this.blockHeight, this.blockWidth, this.blockHeight)
      }
    }

    // Display scores
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${this.score}`, 10, 30);
    ctx.fillText(`Level: ${this.level}`, 10, 60);
    ctx.fillText(`Lines: ${this.lines}`, 10, 90);
  }

  public score = 0;
  public level = 0;
  public lines = 0;

  public spawn(piece: Piece<PieceType>): Piece<PieceType>;
  public spawn(type: PieceType): Piece<PieceType>;
  public spawn(piece: PieceType | Piece<PieceType>) {
    if (!(piece instanceof Piece)) {
      piece = new Piece(piece, this);
    }

    // Right before spawn, check for tetrises and clear them
    //#region Check for tetrises
    let lines = 0;
    for (let y = 0; y < this.height; y++) {
      const row = this.grid[y];
      if (row.every(x => x !== null)) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.width).fill(null));
        lines++;
      }
    }
    if (lines > 0) {
      this.lines += lines;
      this.score += [0, 40, 100, 300, 1200][lines] * (this.level + 1);

      if (this.lines >= (this.level + 1) * 10) {
        this.level++;
      }
    }
    //#endregion

    const x = Math.floor((this.canvas.width / this.blockWidth) / 2)
    const y = 0;
    
    this.pieces[x][y] = piece;

    const success = piece.test(x, y);
    if (!success) {
      alert("Game Over");
      // location.reload();
      return;
    }

    piece.set(x, y);

    return piece;
  }
}