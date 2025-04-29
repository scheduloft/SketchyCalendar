import Tool from "./tool";
import { Point } from "geom/point";
import { Vec } from "geom/vec";
import StateManager, { Id, Card, Stroke } from "state";

export default class DrawTool implements Tool {
  state_manager: StateManager;
  stroke: Stroke | null;
  offset: Point = { x: 0, y: 0 };

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.stroke = null;
  }

  onpointerdown(position: Point) {
    const { stroke, offset } = this.state_manager.createNewStroke(position);
    stroke.points.push(Vec.sub(position, offset));
    this.stroke = stroke;
    this.offset = offset;
  }

  onpointermove(position: Point) {
    if (this.stroke == null) return;
    this.stroke.points.push(Vec.sub(position, this.offset));
  }

  onpointerup(position: Point) {
    this.stroke = null;
  }
}
