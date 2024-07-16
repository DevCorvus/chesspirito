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

type DirectionCoordinate = -1 | 0 | 1;
type Direction = [DirectionCoordinate, DirectionCoordinate];

interface Position {
  x: number;
  y: number;
}

interface Move {
  from: Position;
  to: Position;
  onlyMove?: boolean;
  onlyAttack?: boolean;
}

interface HistoryMove {
  from: Position;
  to: Position;
  capture: ChessPiece | null;
  san: string;
}

type Color = "w" | "b";

interface ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];
  generateMoves(): Move[];
}

type Square = ChessPiece | null;

function isRank(num: number): boolean {
  return num >= 1 && num <= 8;
}

function isOutOfBounds(num: number): boolean {
  return num < 0 || num > 7;
}

function isPositionOutOfBounds(pos: Position) {
  return isOutOfBounds(pos.y) || isOutOfBounds(pos.x);
}

function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function getOppositeColor(color: Color): Color {
  return color === "w" ? "b" : "w";
}

function generateSlidingMoves(piece: ChessPiece, directions: Direction[]) {
  const board = piece.board;
  const moves: Move[] = [];

  for (const [yDirection, xDirection] of directions) {
    const pos = {
      y: piece.position.y + yDirection,
      x: piece.position.x + xDirection,
    };

    while (!isPositionOutOfBounds(pos)) {
      const targetSquare = board.getSquare(pos);

      if (targetSquare === null || targetSquare.color !== piece.color) {
        moves.push({ from: piece.position, to: { ...pos } });
      }

      if (targetSquare !== null) {
        break;
      }

      pos.y += yDirection;
      pos.x += xDirection;
    }
  }

  return moves;
}

class Pawn implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_PAWN : Piece.BLACK_PAWN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const step = this.color === "w" ? -1 : 1;

    const forwardMove: Move = {
      from: this.position,
      to: { y: this.position.y + step, x: this.position.x },
      onlyMove: true,
    };

    const moves: Move[] = [
      forwardMove,
      {
        from: this.position,
        to: { y: this.position.y + step, x: this.position.x - 1 },
        onlyAttack: true,
      },
      {
        from: this.position,
        to: { y: this.position.y + step, x: this.position.x + 1 },
        onlyAttack: true,
      },
    ];

    if (this.moves.length === 0 && this.board.isSquareEmpty(forwardMove.to)) {
      moves.push({
        from: this.position,
        to: { y: this.position.y + step * 2, x: this.position.x },
        onlyMove: true,
      });
    }

    return moves.filter(
      (move) =>
        !isPositionOutOfBounds(move.to) &&
        this.board.getSquare(move.to)?.color !== this.color,
    );
  }
}

class Knight implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const { x, y } = this.position;

    const moves: Move[] = [
      { y: y - 1, x: x - 2 },
      { y: y - 2, x: x - 1 },
      { y: y - 2, x: x + 1 },
      { y: y - 1, x: x + 2 },
      { y: y + 1, x: x + 2 },
      { y: y + 2, x: x + 1 },
      { y: y + 2, x: x - 1 },
      { y: y + 1, x: x - 2 },
    ].map((pos) => ({ from: this.position, to: pos }));

    return moves.filter(
      (move) =>
        !isPositionOutOfBounds(move.to) &&
        this.board.getSquare(move.to)?.color !== this.color,
    );
  }
}

class Bishop implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const directions: Direction[] = [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ];

    return generateSlidingMoves(this, directions);
  }
}

class Rook implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const directions: Direction[] = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];

    return generateSlidingMoves(this, directions);
  }
}

class Queen implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const directions: Direction[] = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ];

    return generateSlidingMoves(this, directions);
  }
}

class King implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  moves: string[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;
    this.color = color;
    this.position = pos;
    this.moves = [];
  }

  generateMoves(): Move[] {
    const { x, y } = this.position;

    const moves: Move[] = [
      { y: y - 1, x: x - 1 },
      { y: y - 1, x: x + 0 },
      { y: y - 1, x: x + 1 },
      { y: y + 0, x: x + 1 },
      { y: y + 1, x: x + 1 },
      { y: y + 1, x: x + 0 },
      { y: y + 1, x: x - 1 },
      { y: y + 0, x: x - 1 },
    ].map((pos) => ({ from: this.position, to: pos }));

    return moves.filter(
      (move) =>
        !isPositionOutOfBounds(move.to) &&
        this.board.getSquare(move.to)?.color !== this.color,
    );
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

interface SanGenerationOptions {
  piece: ChessPiece;
  from: string;
  to: string;
  capture: boolean;
  check: boolean;
  mate: boolean;
}

type GameOver = "0-0" | "1-0" | "0-1";

export class Chesspirito {
  grid: Square[][];
  playingColor: Color;
  currLegalMoves: Move[];
  history: HistoryMove[];
  gameOver: GameOver | null;

  constructor(fen = DEFAULT_FEN) {
    this.grid = [];
    this.history = [];
    this.gameOver = null;

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

    const legalMoves = this.generateLegalMoves(this.playingColor);
    const check = this.inCheck(this.playingColor);

    if (legalMoves.length === 0) {
      if (check) {
        this.gameOver = this.playingColor === "w" ? "1-0" : "0-1";
      } else {
        this.gameOver = "0-0";
      }
    }

    this.currLegalMoves = legalMoves;
  }

  getSquare(pos: Position): Square {
    return this.grid[pos.y][pos.x];
  }

  private setSquare(pos: Position, square: Square): void {
    this.grid[pos.y][pos.x] = square;

    if (square !== null) {
      square.position = pos;
    }
  }

  isSquareEmpty(pos: Position) {
    return this.getSquare(pos) === null;
  }

  private togglePlayingColor() {
    this.playingColor = this.playingColor === "w" ? "b" : "w";
  }

  private getPositionFromMove(mv: string): Position {
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

  private getMoveFromPosition(pos: Position): string {
    return FILES[pos.y] + pos.x;
  }

  private generateSan({
    piece,
    from,
    to,
    capture,
    check,
    mate,
  }: SanGenerationOptions): string {
    let san = "";

    const isPawn = piece instanceof Pawn;

    san += isPawn ? to : piece.type;

    if (isPawn && capture) {
      san = from[0] + "x" + san;
    }

    if (!isPawn && capture) {
      san += "x" + to;
    } else if (!isPawn) {
      san += to;
    }

    if (mate) {
      san += "#";
    } else if (check) {
      san += "+";
    }

    return san;
  }

  private generateMoves(color: Color): Move[] {
    let moves: Move[] = [];

    for (let y = 0; y < RANK_LENGTH; y++) {
      for (let x = 0; x < RANK_LENGTH; x++) {
        const piece = this.getSquare({ y, x });

        if (piece !== null && piece.color === color) {
          const pieceMoves = piece.generateMoves();
          moves = moves.concat(pieceMoves);
        }
      }
    }

    return moves;
  }

  private generateLegalMoves(color: Color): Move[] {
    const legalMoves: Move[] = [];
    const pseudoLegalMoves = this.generateMoves(color);

    const king = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;

    const opponentColor = getOppositeColor(color);

    for (const pseudoLegalMove of pseudoLegalMoves) {
      const square = this.getSquare(pseudoLegalMove.from);
      const targetSquare = this.getSquare(pseudoLegalMove.to);

      this.setSquare(pseudoLegalMove.to, square);
      this.setSquare(pseudoLegalMove.from, null);

      const opponentMoves = this.generateMoves(opponentColor);

      const threatensKing = opponentMoves.some((move) => {
        const piece = this.getSquare(move.to);
        return piece !== null && piece.type === king;
      });

      if (!threatensKing) {
        legalMoves.push(pseudoLegalMove);
      }

      this.setSquare(pseudoLegalMove.to, targetSquare);
      this.setSquare(pseudoLegalMove.from, square);
    }

    return legalMoves;
  }

  private getKingPosition(color: Color): Position {
    const king = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;

    for (let y = 0; y < RANK_LENGTH; y++) {
      for (let x = 0; x < RANK_LENGTH; x++) {
        const piece = this.getSquare({ y, x });

        if (piece !== null && piece.color === color && piece.type === king) {
          return piece.position;
        }
      }
    }

    throw new Error("King not found");
  }

  private inCheck(color: Color) {
    const kingPos = this.getKingPosition(color);
    const opponentColor = getOppositeColor(color);

    const opponentMoves = this.generateMoves(opponentColor);

    return opponentMoves.some((move) => {
      if (!move.onlyMove) {
        return isSamePosition(move.to, kingPos);
      } else {
        return false;
      }
    });
  }

  move(from: string | Position, to: string | Position) {
    if (this.gameOver !== null) {
      throw new Error("Invalid move = GameOver");
    }

    const fromPos =
      typeof from === "string" ? this.getPositionFromMove(from) : from;
    const toPos = typeof to === "string" ? this.getPositionFromMove(to) : to;

    if (isPositionOutOfBounds(fromPos) || isPositionOutOfBounds(toPos)) {
      throw new Error("Invalid move = out of bounds");
    }

    const piece = this.getSquare(fromPos);
    const attackedPiece = this.getSquare(toPos);

    if (piece === null) {
      throw new Error("Invalid move = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid move = not playing color");
    }

    if (attackedPiece?.color === this.playingColor) {
      throw new Error("Invalid move = cannot move to friendly piece");
    }

    if (attackedPiece instanceof King) {
      throw new Error("Invalid attack = King cannot be captured");
    }

    const attacking = Boolean(attackedPiece);

    const isLegalMove = this.currLegalMoves.some((move) => {
      const validPosition =
        isSamePosition(move.from, fromPos) && isSamePosition(move.to, toPos);

      if (move.onlyMove) {
        return validPosition && !attacking;
      } else if (move.onlyAttack) {
        return validPosition && attacking;
      } else {
        return validPosition;
      }
    });

    if (!isLegalMove) {
      throw new Error("Invalid move = " + from + "-" + to);
    }

    this.setSquare(toPos, piece);
    this.setSquare(fromPos, null);

    const opponentColor = getOppositeColor(this.playingColor);

    const check = this.inCheck(opponentColor);
    const opponentLegalMoves = this.generateLegalMoves(opponentColor);

    let mate = false;
    let draw = false;

    if (opponentLegalMoves.length === 0) {
      if (check) {
        mate = true;
      } else {
        draw = true;
      }
    }

    const fromMove =
      typeof from === "object" ? this.getMoveFromPosition(from) : from;
    const toMove = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    piece.moves.push(toMove);
    this.history.push({
      from: fromPos,
      to: toPos,
      capture: attackedPiece,
      san: this.generateSan({
        piece,
        from: fromMove,
        to: toMove,
        capture: Boolean(attackedPiece),
        check,
        mate,
      }),
    });

    if (mate) {
      this.gameOver = this.playingColor === "w" ? "1-0" : "0-1";
    } else if (draw) {
      this.gameOver = "0-0";
    } else {
      this.togglePlayingColor();
      this.currLegalMoves = opponentLegalMoves;
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

    if (lastMove.capture !== null) {
      this.setSquare(lastMove.to, lastMove.capture);
    } else {
      this.setSquare(lastMove.to, null);
    }

    this.togglePlayingColor();
  }

  print() {
    console.log(this.grid);
  }
}
