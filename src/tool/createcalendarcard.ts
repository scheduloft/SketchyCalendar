import Tool from "./tool";
import { Point } from "geom/point";
import StateManager, { Id, Card } from "state";

export default class CreateCalendarCardTool implements Tool {
  state_manager: StateManager;
  cardId: Id<Card> | null;
  downPos: Point = { x: 0, y: 0 };

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.cardId = null;
  }

  onpointerdown(position: Point) {
    this.cardId = this.state_manager.createNewCalendarCard(position, [
      "marcel.goethals@gmail.com",
    ]).cardId;
    this.downPos = position;
  }

  onpointermove(position: Point) {
    if (this.cardId == null) return;
    // const width = position.x - this.downPos.x;
    // const height = position.y - this.downPos.y;
    // this.state_manager.updateCardSize(this.cardId, width, height);
  }

  onpointerup(position: Point) {
    this.cardId = null;
  }
}
