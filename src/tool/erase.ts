import Tool from "./tool";
import { Point } from "geom/point";
import { Vec } from "geom/vec";
import StateManager, { Id, Card, Stroke } from "state";

export default class EraseTool implements Tool {
  state_manager: StateManager;
  down: boolean;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.down = false;
  }

  onpointerdown(position: Point) {
    this.state_manager.erase(position);
    this.down = true;
  }

  onpointermove(position: Point) {
    if (this.down == false) return;
    this.state_manager.erase(position);
  }

  onpointerup(position: Point) {
    this.down = true;
  }
}
