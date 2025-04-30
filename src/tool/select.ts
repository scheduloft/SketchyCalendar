import { Point } from "geom/point";
import { Vec } from "geom/vec";
import StateManager, { Stroke } from "state";
import Tool from "./tool";

export default class SelectTool implements Tool {
  state_manager: StateManager;

  mousedown: Point = { x: 0, y: 0 };

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
  }

  onpointerdown(position: Point): boolean {
    // Drag
    if (this.state_manager.selectedCardInstance) {
      this.mousedown = position;
    }

    // Select
    this.state_manager.selectAtPosition(position);
    if (this.state_manager.selectedCardInstance) {
      return true;
    }
    return false;
  }

  onpointermove(position: Point) {}

  onpointerup(position: Point) {}
}
