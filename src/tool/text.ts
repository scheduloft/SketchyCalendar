import Tool from "./tool";
import { Point } from "geom/point";
import StateManager, { Id, Card } from "state";

export default class CreateTextTool implements Tool {
  state_manager: StateManager;
  cardId: Id<Card> | null;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
  }

  onpointerdown(position: Point) {
    this.state_manager.createNewText(position);
  }

  onpointermove(position: Point) {}

  onpointerup() {}
}
