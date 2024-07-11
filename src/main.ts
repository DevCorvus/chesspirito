import "./style.css";

const RANK_LENGTH = 8;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

enum Piece {
  WHITE_PAWN = "P",
  WHITE_KNIGHT = "N",
  WHITE_BISHOP = "B",
  WHITE_ROOK = "R",
  WHITE_QUEEN = "Q",
  WHITE_KING = "K",
  BLACK_PAWN = "p",
  BLACK_KNIGHT = "n",
  BLACK_BISHOP = "b",
  BLACK_ROOK = "r",
  BLACK_QUEEN = "q",
  BLACK_KING = "k",
}

interface Position {
  x: number;
  y: number;
}

interface Move {
  san: string;
  from: Position;
  to: Position;
}

type Color = "w" | "b";

interface ChessPiece {
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];
  canMove(pos: Position): boolean;
  canAttack(pos: Position): boolean;
}

type Square = ChessPiece | null;

function checkRank(num: number): boolean {
  return num >= 1 && num <= 8;
}

class Pawn implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_PAWN : Piece.BLACK_PAWN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const sameFile = pos.x === this.position.x;

    const canOneStep =
      sameFile && pos.y === this.position.y + (this.color === "w" ? -1 : 1);
    const canTwoStep =
      sameFile && pos.y === this.position.y + (this.color === "w" ? -2 : 2);

    if (this.moves.length > 0) {
      return canOneStep;
    } else {
      return canOneStep || canTwoStep;
    }
  }

  canAttack(pos: Position): boolean {
    const step = this.type === Piece.WHITE_PAWN ? -1 : 1;

    return (
      pos.y === this.position.y + step &&
      (pos.x === this.position.x + step || pos.x === this.position.x - step)
    );
  }
}

class Knight implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(newPos: Position): boolean {
    return true;
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class Bishop implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(newPos: Position): boolean {
    return true;
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class Rook implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(newPos: Position): boolean {
    return true;
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class Queen implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(newPos: Position): boolean {
    return true;
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class King implements ChessPiece {
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(color: Color, pos: Position) {
    this.type = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(newPos: Position): boolean {
    return true;
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class ChessPieceFactory {
  static create(char: Piece, pos: Position) {
    switch (char) {
      case Piece.WHITE_PAWN: {
        return new Pawn("w", pos);
      }
      case Piece.WHITE_KNIGHT: {
        return new Knight("w", pos);
      }
      case Piece.WHITE_BISHOP: {
        return new Bishop("w", pos);
      }
      case Piece.WHITE_ROOK: {
        return new Rook("w", pos);
      }
      case Piece.WHITE_QUEEN: {
        return new Queen("w", pos);
      }
      case Piece.WHITE_KING: {
        return new King("w", pos);
      }
      case Piece.BLACK_PAWN: {
        return new Pawn("b", pos);
      }
      case Piece.BLACK_KNIGHT: {
        return new Knight("b", pos);
      }
      case Piece.BLACK_BISHOP: {
        return new Bishop("b", pos);
      }
      case Piece.BLACK_ROOK: {
        return new Rook("b", pos);
      }
      case Piece.BLACK_QUEEN: {
        return new Queen("b", pos);
      }
      case Piece.BLACK_KING: {
        return new King("b", pos);
      }
    }
  }
}

class Chesspirito {
  private grid: Square[][];
  private playingColor: Color;
  public history: Move[];

  constructor(fen = DEFAULT_FEN) {
    this.grid = [];
    this.history = [];

    for (let y = 0; y < RANK_LENGTH; y++) {
      const emptyRank = Array(RANK_LENGTH).fill(null);
      this.grid.push(emptyRank);
    }

    const fenParts = fen.split(" ");
    const fenPieces = fenParts[0].split("/");
    const fenColor = fenParts[1];

    this.playingColor = fenColor as Color;

    for (let y = 0; y < RANK_LENGTH; y++) {
      const fenRank = fenPieces[y];

      for (let x = 0; x < RANK_LENGTH; x++) {
        const char = fenRank[x];

        if (Object.values(Piece).includes(char as Piece)) {
          this.grid[y][x] = ChessPieceFactory.create(char as Piece, { x, y });
        } else {
          const charNum = Number(char);

          if (isNaN(charNum) || charNum < 1 || charNum > 8) {
            throw new Error("Invalid empty squares");
          }

          x += charNum;
        }
      }
    }
  }

  getPositionFromMove(mv: string): Position {
    if (mv.length !== 2) {
      throw new Error("Invalid move = " + mv);
    }

    const file = mv[0];

    const fileIndex = FILES.indexOf(file);

    if (fileIndex === -1) {
      throw new Error("Invalid file = " + file);
    }

    const rank = mv[1];

    if (!checkRank(Number(rank))) {
      throw new Error("Invalid rank = " + rank);
    }

    return { x: fileIndex, y: Number(rank) - 1 };
  }

  getMoveFromPosition(pos: Position): string {
    return FILES[pos.y] + pos.x;
  }

  move(from: string | Position, to: string | Position) {
    const fromPos =
      typeof from === "string" ? this.getPositionFromMove(from) : from;
    const toPos = typeof to === "string" ? this.getPositionFromMove(to) : to;

    const piece = this.grid[fromPos.y][fromPos.x];

    if (piece === null) {
      throw new Error("Invalid move = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid move = not playing color");
    }

    if (this.grid[toPos.y][toPos.x] !== null) {
      throw new Error("Invalid move = square occupied");
    }

    if (!piece.canMove(toPos)) {
      throw new Error("Invalid move = " + from + "-" + to);
    }

    this.grid[toPos.y][toPos.x] = piece;
    this.grid[fromPos.y][fromPos.x] = null;
    piece.position = toPos;

    const mv = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    piece.moves.push(mv);
    this.history.push({
      from: fromPos,
      to: toPos,
      san:
        piece.type === Piece.WHITE_PAWN || piece.type === Piece.BLACK_PAWN
          ? mv
          : piece.type + mv,
    });

    this.playingColor = this.playingColor === "w" ? "b" : "w";
  }

  attack(from: string | Position, to: string | Position) {
    const fromPos =
      typeof from === "string" ? this.getPositionFromMove(from) : from;
    const toPos = typeof to === "string" ? this.getPositionFromMove(to) : to;

    const piece = this.grid[fromPos.y][fromPos.x];
    const pieceToAttack = this.grid[toPos.y][toPos.x];

    if (piece === null) {
      throw new Error("Invalid attack = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid attack = not playing color");
    }

    if (pieceToAttack === null) {
      throw new Error("Invalid attack = no piece to attack");
    }

    if (piece.color === pieceToAttack.color) {
      throw new Error("Invalid attack = cannot attack same color piece");
    }

    if (!piece.canAttack(toPos)) {
      throw new Error("Invalid attack = " + from + "-" + to);
    }

    this.grid[toPos.y][toPos.x] = piece;
    this.grid[fromPos.y][fromPos.x] = null;
    piece.position = toPos;

    const fromMove =
      typeof from === "object" ? this.getMoveFromPosition(from) : from;
    const toMove = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    piece.moves.push(toMove);
    this.history.push({
      from: fromPos,
      to: toPos,
      san:
        piece.type === Piece.WHITE_PAWN || piece.type === Piece.BLACK_PAWN
          ? fromMove[0] + "x" + toMove
          : piece.type + "x" + toMove,
    });

    this.playingColor = this.playingColor === "w" ? "b" : "w";
  }

  print() {
    console.log(this.grid);
  }
}

const chess = new Chesspirito();

chess.move("e7", "e5");
chess.move("d2", "d4");
chess.move("b7", "b6");
chess.attack("d4", "e5");

chess.print();
console.log(chess.history);
