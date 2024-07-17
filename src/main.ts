import "./style.css";
import { Chesspirito } from "./engine";

const chess = new Chesspirito();

try {
  chess.move("g1", "h3");
  chess.move("a7", "a6");
  chess.move("e2", "e3");
  chess.move("a6", "a5");
  chess.move("f1", "c4");
  chess.move("a5", "a4");
  chess.move("e1", "g1");
} catch (err) {
  console.error(err);
} finally {
  chess.print();
  console.log(chess.history);
  console.log(chess.gameOver);
}
