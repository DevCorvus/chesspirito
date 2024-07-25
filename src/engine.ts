const RANK_LENGTH = 8;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

type File = (typeof FILES)[number];
type Rank = (typeof RANKS)[number];

type SanPosition = `${File}${Rank}`;

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

type Promotion = "N" | "B" | "R" | "Q";

type DirectionCoordinate = -1 | 0 | 1;
type Direction = [DirectionCoordinate, DirectionCoordinate];

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  from: Position;
  to: Position;
  onlyMove?: boolean;
  onlyAttack?: boolean;
  enPassant?: boolean;
}

interface HistoryMove {
  from: Position;
  to: Position;
  capture: ChessPiece | null;
  promotion: ChessPiece | null;
  castling: ChessPiece | null;
  lan: string;
}

type Color = "w" | "b";

interface ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  history: Position[];
  generateMoves(): Move[];
}

type Square = ChessPiece | null;

function getOppositeColor(color: Color): Color {
  return color === "w" ? "b" : "w";
}

function isOutOfBounds(num: number): boolean {
  return num < 0 || num > 7;
}

function isPositionOutOfBounds(pos: Position) {
  return isOutOfBounds(pos.y) || isOutOfBounds(pos.x);
}

export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
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
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_PAWN : Piece.BLACK_PAWN;
    this.color = color;
    this.position = pos;
    this.history = [];
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

    if (this.history.length === 0 && this.board.isSquareEmpty(forwardMove.to)) {
      moves.push({
        from: this.position,
        to: { y: this.position.y + step * 2, x: this.position.x },
        onlyMove: true,
      });
    }

    return moves.filter((move) => {
      if (isPositionOutOfBounds(move.to)) {
        return false;
      }

      const piece = this.board.getSquare(move.to);

      if (piece !== null && move.onlyMove) {
        return false;
      }

      const enPassantable = this.board.enPassantable;

      if (
        piece === null &&
        enPassantable &&
        isSamePosition(
          {
            y: enPassantable.y + (this.board.playingColor === "w" ? 1 : -1),
            x: enPassantable.x,
          },
          move.to,
        )
      ) {
        move.enPassant = true;
        return true;
      } else if (piece === null && move.onlyAttack) {
        return false;
      }

      return piece?.color !== this.color;
    });
  }
}

class Knight implements ChessPiece {
  board: Chesspirito;
  type: Piece;
  color: Color;
  position: Position;
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
    this.color = color;
    this.position = pos;
    this.history = [];
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
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
    this.color = color;
    this.position = pos;
    this.history = [];
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
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
    this.color = color;
    this.position = pos;
    this.history = [];
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
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
    this.color = color;
    this.position = pos;
    this.history = [];
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
  history: Position[];

  constructor(board: Chesspirito, color: Color, pos: Position) {
    this.board = board;
    this.type = color === "w" ? Piece.WHITE_KING : Piece.BLACK_KING;
    this.color = color;
    this.position = pos;
    this.history = [];
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
  static create(board: Chesspirito, type: Piece, pos: Position) {
    switch (type) {
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

class PromotionChessPieceFactory {
  static create(board: Chesspirito, promotion: Promotion, pos: Position) {
    let type: Piece;

    switch (promotion) {
      case "N": {
        type =
          board.playingColor === "w" ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
        break;
      }
      case "B": {
        type =
          board.playingColor === "w" ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
        break;
      }
      case "R": {
        type = board.playingColor === "w" ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
        break;
      }
      case "Q": {
        type =
          board.playingColor === "w" ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
        break;
      }
    }

    return ChessPieceFactory.create(board, type, pos);
  }
}

interface SanGenerationOptions {
  piece: ChessPiece;
  from: SanPosition;
  to: SanPosition;
  capture: boolean;
  promotion: Promotion | null;
  enPassant: boolean;
  check: boolean;
  mate: boolean;
}

type GameOver = "0-0" | "1-0" | "0-1";

export class Chesspirito {
  board: Square[][];
  history: HistoryMove[];
  gameOver: GameOver | null;

  whiteKingPosition: Position | null;
  blackKingPosition: Position | null;
  playingColor: Color;
  check: Color | null;
  currLegalMoves: Move[];
  enPassantable: Position | null;

  constructor(fen = DEFAULT_FEN) {
    this.board = [];
    this.history = [];
    this.gameOver = null;

    this.whiteKingPosition = null;
    this.blackKingPosition = null;
    this.check = null;
    this.enPassantable = null;

    for (let y = 0; y < RANK_LENGTH; y++) {
      const emptyRank = Array(RANK_LENGTH).fill(null);
      this.board.push(emptyRank);
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

    this.check = check ? this.playingColor : null;

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
    return this.board[pos.y][pos.x];
  }

  private setSquare(pos: Position, square: Square): void {
    this.board[pos.y][pos.x] = square;

    if (square !== null) {
      const piece = square;

      piece.position = pos;

      if (piece instanceof King) {
        if (piece.color === "w") {
          this.whiteKingPosition = pos;
        } else {
          this.blackKingPosition = pos;
        }
      }
    }
  }

  isSquareEmpty(pos: Position) {
    return this.getSquare(pos) === null;
  }

  private togglePlayingColor() {
    this.playingColor = getOppositeColor(this.playingColor);
  }

  private getPositionFromMove(mv: string): Position {
    if (mv.length !== 2) {
      throw new Error("Invalid move = " + mv);
    }

    const file = mv[0];
    const fileIndex = FILES.indexOf(file as File);

    if (fileIndex === -1) {
      throw new Error("Invalid file = " + file);
    }

    const rank = mv[1];
    const rankIndex = RANKS.indexOf(Number(rank) as Rank);

    if (rankIndex === -1) {
      throw new Error("Invalid rank = " + rank);
    }

    return { x: fileIndex, y: rankIndex };
  }

  private getMoveFromPosition(pos: Position): SanPosition {
    return (FILES[pos.x] + RANKS[pos.y]) as SanPosition;
  }

  private generateLanFromMove({
    piece,
    from,
    to,
    capture,
    promotion,
    enPassant,
    check,
    mate,
  }: SanGenerationOptions): string {
    let lan = from;

    const isPawn = piece instanceof Pawn;

    if (!isPawn) {
      lan = piece.type + lan;
    }

    if (capture) {
      lan += "x";
    }

    lan += to;

    if (promotion !== null) {
      lan += "=" + promotion;
    }

    if (mate) {
      lan += "#";
    } else if (check) {
      lan += "+";
    }

    if (enPassant) {
      lan += " e.p.";
    }

    return lan;
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

  private isSquareAttacked(attackingColor: Color, target: Position) {
    const moves = this.generateMoves(attackingColor);

    return moves.some((move) => {
      if (!move.onlyMove) {
        return isSamePosition(move.to, target);
      } else {
        return false;
      }
    });
  }

  getKingPosition(color: Color): Position {
    const kingPos =
      color === "w" ? this.whiteKingPosition : this.blackKingPosition;

    if (kingPos === null) {
      throw new Error("King not found");
    }

    return kingPos;
  }

  private inCheck(color: Color) {
    const kingPos = this.getKingPosition(color);
    const opponentColor = getOppositeColor(color);

    return this.isSquareAttacked(opponentColor, kingPos);
  }

  private handleNextTurn({
    mate,
    draw,
    nextLegalMoves,
  }: {
    mate: boolean;
    draw: boolean;
    nextLegalMoves: Move[];
  }) {
    if (mate || draw) {
      this.currLegalMoves = [];
    }

    if (mate) {
      this.gameOver = this.playingColor === "w" ? "1-0" : "0-1";
    } else if (draw) {
      this.gameOver = "0-0";
    } else {
      this.togglePlayingColor();
      this.currLegalMoves = nextLegalMoves;
    }
  }

  private handleCastling(king: King, from: Position, to: Position) {
    if (king.history.length > 0) {
      throw new Error("Invalid castling = not first King move");
    }

    const isQueenside = from.x > to.x;
    const isWhite = this.playingColor === "w";

    let rookFrom: Position;
    let rookTo: Position;
    let emptySquaresRequired: Position[];

    if (isQueenside) {
      const whiteRook: Position = { y: 7, x: 0 };
      const blackRook: Position = { y: 0, x: 0 };

      const whiteRookTo: Position = { y: 7, x: 3 };
      const blackRookTo: Position = { y: 0, x: 3 };

      const whiteEmptySquaresRequired: Position[] = [
        { y: 7, x: 3 },
        { y: 7, x: 2 },
        { y: 7, x: 1 },
      ];
      const blackEmptySquaresRequired: Position[] = [
        { y: 0, x: 3 },
        { y: 0, x: 2 },
        { y: 0, x: 1 },
      ];

      rookFrom = isWhite ? whiteRook : blackRook;
      rookTo = isWhite ? whiteRookTo : blackRookTo;

      emptySquaresRequired = isWhite
        ? whiteEmptySquaresRequired
        : blackEmptySquaresRequired;
    } else {
      const whiteRook: Position = { y: 7, x: 7 };
      const blackRook: Position = { y: 0, x: 7 };

      const whiteRookTo: Position = { y: 7, x: 5 };
      const blackRookTo: Position = { y: 0, x: 5 };

      const whiteEmptySquaresRequired: Position[] = [
        { y: 7, x: 5 },
        { y: 7, x: 6 },
      ];
      const blackEmptySquaresRequired: Position[] = [
        { y: 0, x: 5 },
        { y: 0, x: 6 },
      ];

      rookFrom = isWhite ? whiteRook : blackRook;
      rookTo = isWhite ? whiteRookTo : blackRookTo;

      emptySquaresRequired = isWhite
        ? whiteEmptySquaresRequired
        : blackEmptySquaresRequired;
    }

    const rook = this.getSquare(rookFrom);

    if (rook === null || rook.history.length > 0) {
      throw new Error("Invalid castling = not first Rook move");
    }

    for (const pos of emptySquaresRequired) {
      if (!this.isSquareEmpty(pos)) {
        throw new Error("Invalid castling = blocked by piece");
      }
    }

    if (this.inCheck(this.playingColor)) {
      throw new Error("Invalid castling = King in check");
    }

    const notAttackedSquaresRequired = emptySquaresRequired.slice(0, 2);
    const opponentColor = getOppositeColor(this.playingColor);

    for (const target of notAttackedSquaresRequired) {
      if (this.isSquareAttacked(opponentColor, target)) {
        throw new Error("Invalid castling = blocked by attack");
      }
    }

    this.setSquare(to, king);
    this.setSquare(from, null);

    this.setSquare(rookTo, rook);
    this.setSquare(rookFrom, null);

    const opponentLegalMoves = this.generateLegalMoves(opponentColor);
    const check = this.inCheck(opponentColor);

    this.check = check ? opponentColor : null;

    let mate = false;
    let draw = false;

    if (opponentLegalMoves.length === 0) {
      if (check) {
        mate = true;
      } else {
        draw = true;
      }
    }

    king.history.push(from);
    rook.history.push(rookFrom);

    let san = isQueenside ? "O-O-O" : "O-O";

    if (mate) {
      san += "#";
    } else if (check) {
      san += "+";
    }

    this.history.push({
      from,
      to,
      capture: null,
      promotion: null,
      castling: rook,
      lan: san,
    });

    this.handleNextTurn({ mate, draw, nextLegalMoves: opponentLegalMoves });
  }

  move(
    from: SanPosition | Position,
    to: SanPosition | Position,
    promotion: Promotion = "Q",
  ) {
    if (this.gameOver !== null) {
      throw new Error("Invalid move = GameOver");
    }

    const fromPos =
      typeof from === "string" ? this.getPositionFromMove(from) : from;
    const toPos = typeof to === "string" ? this.getPositionFromMove(to) : to;

    const fromMove =
      typeof from === "object" ? this.getMoveFromPosition(from) : from;
    const toMove = typeof to === "object" ? this.getMoveFromPosition(to) : to;

    if (isPositionOutOfBounds(fromPos) || isPositionOutOfBounds(toPos)) {
      throw new Error("Invalid move = out of bounds");
    }

    const piece = this.getSquare(fromPos);
    const targetPiece = this.getSquare(toPos);

    if (piece === null) {
      throw new Error("Invalid move = no piece");
    }

    if (piece.color !== this.playingColor) {
      throw new Error("Invalid move = not playing color");
    }

    if (targetPiece?.color === this.playingColor) {
      throw new Error("Invalid move = cannot move to friendly piece");
    }

    if (targetPiece instanceof King) {
      throw new Error("Invalid move = King cannot be captured");
    }

    if (
      piece instanceof King &&
      fromPos.y === toPos.y &&
      Math.abs(toPos.x - fromPos.x) === 2
    ) {
      return this.handleCastling(piece, fromPos, toPos);
    }

    const attacking = targetPiece !== null;
    let enPassant = false;

    const isLegalMove = this.currLegalMoves.some((move) => {
      const validPosition =
        isSamePosition(move.from, fromPos) && isSamePosition(move.to, toPos);

      if (!validPosition) {
        return false;
      }

      if (move.enPassant) {
        enPassant = true;
      }

      return true;
    });

    if (!isLegalMove) {
      throw new Error("Invalid move = " + fromMove + "-" + toMove);
    }

    let capture = targetPiece;

    this.setSquare(toPos, piece);
    this.setSquare(fromPos, null);

    if (this.enPassantable && enPassant) {
      capture = this.getSquare(this.enPassantable);
      this.setSquare(this.enPassantable, null);
    }

    let hasPromoted = false;

    if (piece instanceof Pawn) {
      if (!attacking && Math.abs(toPos.y - fromPos.y) === 2) {
        this.enPassantable = toPos;
      } else {
        this.enPassantable = null;
      }

      const lastRank = this.playingColor === "w" ? 0 : 7;

      if (toPos.y === lastRank) {
        const newPiece = PromotionChessPieceFactory.create(
          this,
          promotion,
          toPos,
        );

        this.setSquare(toPos, newPiece);
        hasPromoted = true;
      }
    }

    const opponentColor = getOppositeColor(this.playingColor);

    const opponentLegalMoves = this.generateLegalMoves(opponentColor);
    const check = this.inCheck(opponentColor);

    this.check = check ? opponentColor : null;

    let mate = false;
    let draw = false;

    if (opponentLegalMoves.length === 0) {
      if (check) {
        mate = true;
      } else {
        draw = true;
      }
    }

    piece.history.push(fromPos);
    this.history.push({
      from: fromPos,
      to: toPos,
      capture,
      promotion: hasPromoted ? piece : null,
      castling: null,
      lan: this.generateLanFromMove({
        piece,
        from: fromMove,
        to: toMove,
        capture: capture !== null,
        promotion: hasPromoted ? promotion : null,
        enPassant,
        check,
        mate,
      }),
    });

    this.handleNextTurn({ mate, draw, nextLegalMoves: opponentLegalMoves });
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

    movedPiece.history.pop();

    if (lastMove.promotion !== null) {
      this.setSquare(lastMove.from, lastMove.promotion);
      lastMove.promotion.history.pop();
    } else {
      this.setSquare(lastMove.from, movedPiece);
    }

    if (lastMove.capture !== null) {
      if (isSamePosition(lastMove.to, lastMove.capture.position)) {
        this.setSquare(lastMove.to, lastMove.capture);
      } else {
        this.setSquare(lastMove.capture.position, lastMove.capture);
        this.setSquare(lastMove.to, null);
        this.enPassantable = lastMove.capture.position;
      }
    } else {
      this.setSquare(lastMove.to, null);
    }

    if (lastMove.castling !== null) {
      const rookFrom = lastMove.castling.history.pop();

      if (!rookFrom) {
        throw new Error("Invalid undo = unexpected castling error");
      }

      this.setSquare(lastMove.castling.position, null);
      this.setSquare(rookFrom, lastMove.castling);
    }

    if (this.gameOver === null) {
      this.togglePlayingColor();
    }

    if (this.inCheck(this.playingColor)) {
      this.check = this.playingColor;
    } else {
      this.check = null;
    }

    this.gameOver = null;
    this.currLegalMoves = this.generateLegalMoves(this.playingColor);
  }

  getLegalMoves(from: Position) {
    return this.currLegalMoves.filter((move) =>
      isSamePosition(move.from, from),
    );
  }
}
