import { Point } from "geom/point";
import StateManager, { Stroke } from "state";
import Selection from "selection";
import Tool from "./tool";
import { Vec } from "geom/vec";
import { posix } from "node:path/posix";

export default class SelectTool implements Tool {
  state_manager: StateManager;
  selection: Selection;

  downmouse: Point = { x: 0, y: 0 };
  lastmouse: Point = { x: 0, y: 0 };
  dragging: boolean = false;

  constructor(state_manager: StateManager, selection: Selection) {
    this.state_manager = state_manager;
    this.selection = selection;
  }

  onpointerdown(position: Point) {
    this.lastmouse = position;
    this.downmouse = position;

    if (this.selection.active()) {
      if (!this.selection.click(position)) {
        this.dragging = true;
      }
    } else {
      this.selection.selectAtPosition(position);
    }
  }

  onpointermove(position: Point) {
    if (this.selection.active() && this.dragging) {
      this.selection.drag(Vec.sub(position, this.lastmouse));
    }
    this.lastmouse = position;
  }

  onpointerup(position: Point) {
    if (this.selection.active() && this.dragging) {
      this.dragging = false;
      if (Vec.dist(this.downmouse, position) < 5) {
        this.selection.clear();
      }
    }
  }
}
