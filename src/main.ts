import "./style.css";
import { Chesspirito } from "./engine";

const chess = new Chesspirito();

try {
  chess.move("e7", "e6");
  chess.move("a2", "a3");
  chess.move("f8", "c5");
  chess.move("a3", "a4");
  chess.move("d8", "f6");
  chess.move("a4", "a5");
  chess.move("f6", "f2");
} catch (err) {
  console.error(err);
} finally {
  chess.print();
  console.log(chess.history);
  console.log(chess.gameOver);
}
