import "./style.css";
import { Chesspirito } from "./engine";

const chess = new Chesspirito();

try {
  chess.move("e7", "e5");
  chess.move("d2", "d4");
  chess.move("b7", "b6");
  chess.attack("d4", "e5");
  chess.move("b8", "a6");
  chess.move("b1", "a3");
  chess.move("c8", "b7");
  chess.move("c1", "g5");
  chess.attack("d8", "g5");
  chess.move("a3", "b5");
  chess.attack("b7", "g2");
} catch (err) {
  console.error(err);
} finally {
  chess.print();
  console.log(chess.history);
}
