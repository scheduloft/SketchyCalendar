import { Point } from "geom/point";
import StateManager from "state";
import Tool from "./tool";

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

  onpointerup() {
    this.down = false;
  }
}
