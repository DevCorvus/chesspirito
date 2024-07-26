import "./style.css";
import { Chesspirito, Position, isSamePosition } from "./engine";

const chess = new Chesspirito();

const CHESS_PIECE_IMAGES = {
  P: "/pieces/pawn.png",
  N: "/pieces/knight.png",
  B: "/pieces/bishop.png",
  R: "/pieces/rook.png",
  Q: "/pieces/queen.png",
  K: "/pieces/king.png",
} as const;

type ChessPieceImage = keyof typeof CHESS_PIECE_IMAGES;

const chessboard = document.getElementById("chessboard")!;
const scoreboard = document.getElementById("scoreboard")!;
const undoBtn = document.getElementById("undo")!;
const gameoverStatus = document.getElementById("gameover-status")!;

undoBtn.addEventListener("click", () => {
  try {
    chess.undo();
    renderChessboardFrame();
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      alert(err.message);
    }
  }
});

let selected: Position | null = null;

function getChessboardSquare(pos: Position): HTMLDivElement {
  return chessboard.querySelector(`[data-y="${pos.y}"][data-x="${pos.x}"]`)!;
}

function getBoxShadowEffect(color: string): string {
  return "inset 0 0 13px 0 " + color;
}

function renderGameOverStatus() {
  gameoverStatus.textContent = chess.gameOver !== null ? chess.gameOver : "N/A";
}

function renderLegalMoves(from: Position) {
  const legalMoves = chess.getLegalMoves(from);

  for (const move of legalMoves) {
    const square = getChessboardSquare(move.to);
    const targetPiece = chess.getSquare(move.to);

    if ((targetPiece !== null && !move.onlyMove) || move.onlyAttack) {
      square.style.boxShadow = getBoxShadowEffect("red");
    } else {
      square.style.boxShadow = getBoxShadowEffect("lime");
    }
  }
}

function renderCastlingMoves() {
  const { queenside, kingside } = chess.currCastlingRights;
  const boxShadow = getBoxShadowEffect("deepskyblue");

  if (queenside !== null) {
    const square = getChessboardSquare(queenside.target);
    square.style.boxShadow = boxShadow;
  }

  if (kingside !== null) {
    const square = getChessboardSquare(kingside.target);
    square.style.boxShadow = boxShadow;
  }
}

function renderCheck() {
  if (chess.check !== null) {
    const kingInCheckPos = chess.getKingPosition(chess.check);
    const square = getChessboardSquare(kingInCheckPos);

    square.style.boxShadow = getBoxShadowEffect("cyan");
  }
}

function unrenderEffects() {
  for (const square of chessboard.children as HTMLCollectionOf<HTMLDivElement>) {
    square.style.boxShadow = "";
  }
}

function renderChessboard() {
  let colorState = false;
  chess.board.forEach((rank, y) => {
    rank.forEach((_, x) => {
      const square = document.createElement("div");

      square.style.background = colorState ? "#5a5a6a" : "#b1b1c1";
      square.dataset.y = String(y);
      square.dataset.x = String(x);

      square.addEventListener("dragstart", () => {
        if (chess.gameOver !== null) return;

        selected = { y, x };
        renderLegalMoves(selected);

        const kingPos = chess.getKingPosition(chess.playingColor);

        if (isSamePosition(selected, kingPos)) {
          renderCastlingMoves();
        }
      });

      square.addEventListener("dragend", () => {
        selected = null;
        unrenderEffects();
        renderCheck();
      });

      square.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      square.addEventListener("drop", (e) => {
        const square = e.currentTarget as HTMLDivElement;

        const targetPos = {
          y: Number(square.dataset.y),
          x: Number(square.dataset.x),
        };

        if (selected && !isSamePosition(selected, targetPos)) {
          try {
            chess.move(selected, targetPos);
            renderChessboardFrame();

            if (chess.gameOver !== null) {
              alert(chess.gameOver);
            }
          } catch (err) {
            console.error(err);
            if (err instanceof Error) {
              alert(err.message);
            }
          } finally {
            selected = null;
          }
        }
      });

      chessboard.append(square);

      colorState = !colorState;
    });
    colorState = !colorState;
  });
}

function renderPieces() {
  for (const square of chessboard.children as HTMLCollectionOf<HTMLDivElement>) {
    square.innerHTML = "";

    const pos = { y: Number(square.dataset.y), x: Number(square.dataset.x) };
    const piece = chess.getSquare(pos);

    if (piece !== null) {
      const img = document.createElement("img");
      const chessPieceType = piece.type.toUpperCase() as ChessPieceImage;

      img.src = CHESS_PIECE_IMAGES[chessPieceType];

      if (piece.color === "b") {
        img.style.filter = "invert(100%)";
      }

      if (piece.type === "p") {
        img.style.transform = "rotateX(180deg)";
      }

      square.appendChild(img);
    }
  }
}

function renderScore() {
  scoreboard.innerHTML = "";

  for (const move of chess.history) {
    const span = document.createElement("span");
    span.textContent = move.lan;
    scoreboard.appendChild(span);
  }
}

function renderChessboardFrame() {
  unrenderEffects();
  renderPieces();
  renderCheck();
  renderScore();
  renderGameOverStatus();
}

renderChessboard();
renderChessboardFrame();
