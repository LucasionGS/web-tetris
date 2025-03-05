import Tetris, { HexColor } from "./Tetris";

export type PieceType = | "O"
                        | "I"
                        | "S"
                        | "Z"
                        | "L"
                        | "J"
                        | "T";

export type PiecePattern = (" " | "X" | "O")[][];
export enum Direction {
  TOP = 0,
  LEFT = 1,
  BOTTOM = 2,
  RIGHT = 3
}

export default class Piece<T extends PieceType> {
  constructor(private type: T, private game: Tetris) {
    const [left, lPivot] = Piece.rotate90(this.patterns[this.type]);
    const [bottom, bPivot] = Piece.rotate90(left);
    const [right, rPivot] = Piece.rotate90(bottom);
    const [top, tPivot] = Piece.rotate90(right);
    this.cycle = [top, left, bottom, right];
    this.pivots = [tPivot, lPivot, bPivot, rPivot];

    // console.log(this.cycle, this.pivots);
    switch (type) {
      case "O": this.color = "fef84c"; break;
      case "I": this.color = "51e1fc"; break;
      case "S": this.color = "e93d1e"; break;
      case "Z": this.color = "79ae3d"; break;
      case "L": this.color = "f69230"; break;
      case "J": this.color = "f16eb9"; break;
      case "T": this.color = "943692"; break;
    
      default:
        this.color = "fff";
        break;
    }
    
  }

  public x?: number;
  public y?: number;
  public color: HexColor;

  public direction: Direction = Direction.TOP;

  public test(x: number, y: number) {
    if (!this.populate(x, y, this.direction, true)) {
      return false;
    }
    return true;
  }
  
  public set(x: number, y: number) {
    this.populate(this.x ?? x, this.y ?? y, this.direction, null)
    
    if (this.x != null && this.y != null && !this.test(x, y)) {
      this.populate(this.x, this.y, this.direction, this.color)
      return false;
    }
    
    this.x = x;
    this.y = y;

    this.populate(this.x, this.y, this.direction, this.color)
    return true;
  }
  
  public rotate() {
    this.populate(this.x!, this.y!, this.direction, null);
    const next = Piece.rotateDirection90(this.direction);
    if (this.x != null && this.y != null && !this.populate(this.x, this.y, next, true)) {
      this.populate(this.x, this.y, this.direction, this.color)
      return false;
    }
    this.populate(this.x!, this.y!, this.direction = next, this.color);
  }
  
  public static rotateDirection90(direction: Direction): Direction {
    return (direction + 1) % (Direction.RIGHT + 1);
  }

  public static rotateDirection180(direction: Direction): Direction {
    return (direction + 2) % (Direction.RIGHT + 1);
  }

  public static rotateDirectionMinus90(direction: Direction): Direction {
    return (direction + 3) % (Direction.RIGHT + 1);
  }
  
  private populate(x: number, y: number, direction: Direction, checkOnly: true): boolean;
  private populate(x: number, y: number, direction: Direction, color: HexColor | null): boolean;
  private populate(x: number, y: number, direction: Direction, color: HexColor | null | true) {
    const checkOnly = color == true;
    const g = this.game;
    const pa = this.cycle[direction];
    const pi = this.pivots[direction];
    const newColumns: [number | null, | number | null] = [null, null];

    for (let iy = 0; iy < pa.length; iy++) {
      const row = pa[iy];
      for (let ix = 0; ix < row.length; ix++) {
        const xItem = row[ix];
        if (checkOnly) {
          const content = g.getGrid(-pi.x + ix + x, -pi.y + iy + y);
          if (content !== null) {
            // debugger;
            if (xItem !== " ") return false;
          }
        }
        else {
          switch (xItem) {
            case "X":
            case "O":
              const posX = -pi.x + ix + x;
              g.setGrid(posX, -pi.y + iy + y, color)
              if (newColumns[0] === null || posX < newColumns[0]!) {
                newColumns[0] = posX;
              }
              if (newColumns[1] === null || posX > newColumns[1]!) {
                newColumns[1] = posX;
              }
              break;
          }
        }
      }
    }

    [g.lastDrawColumns[0], g.lastDrawColumns[1]] = [newColumns[0]!, newColumns[1]!];
    return true;
  }

  private cycle: PiecePattern[];
  private pivots: { x: number, y: number }[];

  private static rotate90(matrix: PiecePattern): [PiecePattern, { x: number, y: number }] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: PiecePattern = Array.from({ length: cols }, () => Array(rows));
    const pivot = { x: 0, y: 0 }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const char = rotated[c][rows - 1 - r] = matrix[r][c];
            if (char === "O") {
              pivot.x = rows - 1 - r;
              pivot.y = c;
            }
        }
    }

    return [rotated, pivot];
  }

  private patterns: Record<PieceType, PiecePattern> = {
    O: [
      ["X", "O"],
      ["X", "X"]
    ],
    I: [
      ["X"],
      ["O"],
      ["X"],
      ["X"],
    ],
    S: [
      [" ", "O", "X"],
      ["X", "X", " "],
    ],
    Z: [
      ["X", "O", " "],
      [" ", "X", "X"],
    ],
    L: [
      ["X", " "],
      ["O", " "],
      ["X", "X"],
    ],
    J: [
      [" ", "X"],
      [" ", "O"],
      ["X", "X"],
    ],
    T: [
      ["X", "O", "X"],
      [" ", "X", " "],
    ]
  }

  public down() {
    return this.set(this.x!, this.y! + 1);
  }
  public left() {
    return this.set(this.x! + 1, this.y!);
  }
  public right() {
    return this.set(this.x! - 1, this.y!);
  }

  public checkDown() {
    // Only check the bottom row
    const pa = this.cycle[this.direction];
    const pi = this.pivots[this.direction];
    const g = this.game;
    for (let ix = 0; ix < pa[pa.length - 1].length; ix++) {
      if (pa[pa.length - 1][ix] === "X" || pa[pa.length - 1][ix] === "O") {
        try {
          const x = -pi.x + ix + this.x!;
          const y = -pi.y + pa.length + this.y!;
          // console.log(x, y);
          // debugger;
          const item = g.getGrid(x, y);
          if (item !== null) {
            return false;
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }
    return true;
  }

  public checkLeft() {
    const pa = this.cycle[this.direction];
    const pi = this.pivots[this.direction];
    const g = this.game;
    for (let iy = 0; iy < pa.length; iy++) {
      if (pa[iy][0] === "X" || pa[iy][0] === "O") {
        try {
          const x = -pi.x + this.x! - 1;
          const y = -pi.y + iy + this.y!;
          const item = g.getGrid(x, y);
          if (item !== null) {
            return false;
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }
    return true;
  }

  public checkRight() {
    const pa = this.cycle[this.direction];
    const pi = this.pivots[this.direction];
    const g = this.game;
    for (let iy = 0; iy < pa.length; iy++) {
      if (pa[iy][pa[iy].length - 1] === "X" || pa[iy][pa[iy].length - 1] === "O") {
        try {
          const x = -pi.x + pa[iy].length + this.x!;
          const y = -pi.y + iy + this.y!;
          const item = g.getGrid(x, y);
          if (item !== null) {
            return false;
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }
    return true;
  }
}