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
  capturedPiece: ChessPiece | null;
}

type Color = "w" | "b";

interface ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];
  canMove(pos: Position): boolean;
  canAttack(pos: Position): boolean;
}

type Square = ChessPiece | null;

function isRank(num: number): boolean {
  return num >= 1 && num <= 8;
}

function isOutOfBoundaries(num: number): boolean {
  return num < 0 || num > 7;
}

class Pawn implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_PAWN : Piece.BLACK_PAWN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const sameFile = pos.x === this.position.x;

    if (!sameFile) {
      return false;
    }

    const yForward = this.position.y + (this.color === "w" ? -1 : 1);
    const canStepOne = sameFile && pos.y === yForward;

    if (canStepOne) {
      return true;
    }

    if (this.moves.length === 0) {
      const canStepTwo =
        this.board.isSquareEmpty({ x: this.position.x, y: yForward }) &&
        pos.y === this.position.y + (this.color === "w" ? -2 : 2);

      return canStepTwo;
    }

    return false;
  }

  canAttack(pos: Position): boolean {
    const step = this.color === "w" ? -1 : 1;

    return (
      pos.y === this.position.y + step &&
      (pos.x === this.position.x + step || pos.x === this.position.x - step)
    );
  }
}

class Knight implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const { x, y } = this.position;

    const possibleMoves: Position[] = [
      { y: y - 1, x: x - 2 },
      { y: y - 2, x: x - 1 },
      { y: y - 2, x: x + 1 },
      { y: y - 1, x: x + 2 },
      { y: y + 1, x: x + 2 },
      { y: y + 2, x: x + 1 },
      { y: y + 2, x: x - 1 },
      { y: y + 1, x: x - 2 },
    ];

    return possibleMoves.some((pm) => pos.x === pm.x && pos.y === pm.y);
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class Bishop implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (
        !isOutOfBoundaries(yCoord) &&
        !isOutOfBoundaries(xCoord) &&
        this.board.isSquareEmpty({ x: xCoord, y: yCoord })
      ) {
        if (pos.y === yCoord && pos.x === xCoord) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }

  canAttack(pos: Position): boolean {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (!isOutOfBoundaries(yCoord) && !isOutOfBoundaries(xCoord)) {
        const isTargetPosition = pos.y === yCoord && pos.x === xCoord;
        const isEmptySquare = this.board.isSquareEmpty({
          x: xCoord,
          y: yCoord,
        });

        if (!isEmptySquare && !isTargetPosition) {
          break;
        }

        if (isTargetPosition) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }
}

class Rook implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const directions = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (
        !isOutOfBoundaries(yCoord) &&
        !isOutOfBoundaries(xCoord) &&
        this.board.isSquareEmpty({ x: xCoord, y: yCoord })
      ) {
        if (pos.y === yCoord && pos.x === xCoord) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }

  canAttack(pos: Position): boolean {
    const directions = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (!isOutOfBoundaries(yCoord) && !isOutOfBoundaries(xCoord)) {
        const isTargetPosition = pos.y === yCoord && pos.x === xCoord;
        const isEmptySquare = this.board.isSquareEmpty({
          x: xCoord,
          y: yCoord,
        });

        if (!isEmptySquare && !isTargetPosition) {
          break;
        }

        if (isTargetPosition) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }
}

class Queen implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const directions = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (
        !isOutOfBoundaries(yCoord) &&
        !isOutOfBoundaries(xCoord) &&
        this.board.isSquareEmpty({ x: xCoord, y: yCoord })
      ) {
        if (pos.y === yCoord && pos.x === xCoord) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }

  canAttack(pos: Position): boolean {
    const directions = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [yDirection, xDirection] of directions) {
      let yCoord = this.position.y + yDirection;
      let xCoord = this.position.x + xDirection;

      while (!isOutOfBoundaries(yCoord) && !isOutOfBoundaries(xCoord)) {
        const isTargetPosition = pos.y === yCoord && pos.x === xCoord;
        const isEmptySquare = this.board.isSquareEmpty({
          x: xCoord,
          y: yCoord,
        });

        if (!isEmptySquare && !isTargetPosition) {
          break;
        }

        if (isTargetPosition) {
          return true;
        }

        yCoord += yDirection;
        xCoord += xDirection;
      }
    }

    return false;
  }
}

class King implements ChessPiece {
  public board: Chesspirito;
  public type: Piece;
  public color: Color;
  public position: Position;
  public moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  canMove(pos: Position): boolean {
    const { x, y } = this.position;

    const possibleMoves: Position[] = [
      { y: y - 1, x: x - 1 },
      { y: y - 1, x: x + 0 },
      { y: y - 1, x: x + 1 },
      { y: y + 0, x: x + 1 },
      { y: y + 1, x: x + 1 },
      { y: y + 1, x: x + 0 },
      { y: y + 1, x: x - 1 },
      { y: y + 0, x: x - 1 },
    ];

    return possibleMoves.some((pm) => pos.x === pm.x && pos.y === pm.y);
  }

  canAttack(pos: Position): boolean {
    return this.canMove(pos);
  }
}

class ChessPieceFactory {
  static create(board: Chesspirito, char: Piece, pos: Position) {
    switch (char) {
      case Piece.WHITE_PAWN: {
        return new Pawn(board, "w", pos);
      }
      case Piece.WHITE_KNIGHT: {
        return new Knight(board, "w", pos);
      }
      case Piece.WHITE_BISHOP: {
        return new Bishop(board, "w", pos);
      }
      case Piece.WHITE_ROOK: {
        return new Rook(board, "w", pos);
      }
      case Piece.WHITE_QUEEN: {
        return new Queen(board, "w", pos);
      }
      case Piece.WHITE_KING: {
        return new King(board, "w", pos);
      }
      case Piece.BLACK_PAWN: {
        return new Pawn(board, "b", pos);
      }
      case Piece.BLACK_KNIGHT: {
        return new Knight(board, "b", pos);
      }
      case Piece.BLACK_BISHOP: {
        return new Bishop(board, "b", pos);
      }
      case Piece.BLACK_ROOK: {
        return new Rook(board, "b", pos);
      }
      case Piece.BLACK_QUEEN: {
        return new Queen(board, "b", pos);
      }
      case Piece.BLACK_KING: {
        return new King(board, "b", pos);
      }
    }
  }
}

export class Chesspirito {
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
          const position: Position = { x, y };
          const piece = ChessPieceFactory.create(this, char as Piece, position);

          this.setSquare(position, piece);
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

  getSquare(pos: Position): Square {
    return this.grid[pos.y][pos.x];
  }

  setSquare(pos: Position, square: Square): void {
    this.grid[pos.y][pos.x] = square;

    if (square !== null) {
      square.position = pos;
    }
  }

  isSquareEmpty(pos: Position) {
    return this.getSquare(pos) === null;
  }

  togglePlayingColor() {
    this.playingColor = this.playingColor === "w" ? "b" : "w";
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

    if (!isRank(Number(rank))) {
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

    const piece = this.getSquare(fromPos);

    if (piece === null) {
      throw new Error("Invalid move = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid move = not playing color");
    }

    if (!this.isSquareEmpty(toPos)) {
      throw new Error("Invalid move = square occupied");
    }

    if (!piece.canMove(toPos)) {
      throw new Error("Invalid move = " + from + "-" + to);
    }

    this.setSquare(toPos, piece);
    this.setSquare(fromPos, null);

    const mv = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    piece.moves.push(mv);
    this.history.push({
      san: piece instanceof Pawn ? mv : piece.type + mv,
      from: fromPos,
      to: toPos,
      capturedPiece: null,
    });

    this.togglePlayingColor();

    // Following KISS principle (Brute force)
    if (this.inCheck(this.playingColor === "w" ? "b" : "w")) {
      this.undo();
      throw new Error("Invalid move = King in check");
    }
  }

  attack(from: string | Position, to: string | Position) {
    const fromPos =
      typeof from === "string" ? this.getPositionFromMove(from) : from;
    const toPos = typeof to === "string" ? this.getPositionFromMove(to) : to;

    const piece = this.getSquare(fromPos);
    const attackedPiece = this.getSquare(toPos);

    if (piece === null) {
      throw new Error("Invalid attack = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid attack = not playing color");
    }

    if (attackedPiece === null) {
      throw new Error("Invalid attack = no piece to attack");
    }

    if (piece.color === attackedPiece.color) {
      throw new Error("Invalid attack = cannot attack same color piece");
    }

    if (attackedPiece instanceof King) {
      throw new Error("Invalid attack = King cannot be captured");
    }

    if (!piece.canAttack(toPos)) {
      throw new Error("Invalid attack = " + from + "-" + to);
    }

    this.setSquare(toPos, piece);
    this.setSquare(fromPos, null);

    const fromMove =
      typeof from === "object" ? this.getMoveFromPosition(from) : from;
    const toMove = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    piece.moves.push(toMove);
    this.history.push({
      san:
        piece instanceof Pawn
          ? fromMove[0] + "x" + toMove
          : piece.type + "x" + toMove,
      from: fromPos,
      to: toPos,
      capturedPiece: attackedPiece,
    });

    this.togglePlayingColor();

    // Following KISS principle (Brute force)
    if (this.inCheck(this.playingColor === "w" ? "b" : "w")) {
      this.undo();
      throw new Error("Invalid attack = King in check");
    }
  }

  undo() {
    const lastMove = this.history.pop();

    if (!lastMove) {
      throw new Error("Invalid undo = clean history");
    }

    const movedPiece = this.getSquare(lastMove.to);

    if (movedPiece === null) {
      throw new Error("Invalid undo = unexpected nullish piece");
    }

    this.setSquare(lastMove.from, movedPiece);
    movedPiece.moves.pop();

    if (lastMove.capturedPiece !== null) {
      this.setSquare(lastMove.to, lastMove.capturedPiece);
    } else {
      this.setSquare(lastMove.to, null);
    }

    this.togglePlayingColor();
  }

  isSquareAttacked(position: string | Position) {
    const pos =
      typeof position === "string"
        ? this.getPositionFromMove(position)
        : position;

    const piece = this.getSquare(pos);

    if (piece === null) {
      throw new Error("Invalid calculation = no piece");
    }

    for (let y = 0; y < RANK_LENGTH; y++) {
      for (let x = 0; x < RANK_LENGTH; x++) {
        const attackingPiece = this.getSquare({ y, x });

        if (
          attackingPiece !== null &&
          attackingPiece.color !== piece.color &&
          attackingPiece.canAttack(pos)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  inCheck(color: Color) {
    for (let y = 0; y < RANK_LENGTH; y++) {
      for (let x = 0; x < RANK_LENGTH; x++) {
        const piece = this.getSquare({ y, x });

        if (piece !== null && piece instanceof King && piece.color === color) {
          return this.isSquareAttacked({ y, x });
        }
      }
    }

    throw new Error("Invalid calculation = King not found");
  }

  print() {
    console.log(this.grid);
  }
}
