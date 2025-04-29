import Tool from "./tool";
import { Point } from "geom/point";
import StateManager, { Id, CardInstance } from "state";

export default class CopyCardTool implements Tool {
  state_manager: StateManager;
  instance: CardInstance | null;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.instance = null;
  }

  onpointerdown(position: Point) {
    const template = this.state_manager.findCardInstanceAt(position);
    if (!template) return;

    this.instance = this.state_manager.createCardInstance(
      template.cardId,
      position,
    );
  }

  onpointermove(position: Point) {
    if (!this.instance) return;
    this.state_manager.moveCardInstance(this.instance.id, position);
  }

  onpointerup(position: Point) {
    this.instance = null;
  }
}
