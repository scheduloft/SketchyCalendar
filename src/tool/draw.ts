import { Point } from "geom/point";
import { Vec } from "geom/vec";
import StateManager, { Stroke } from "state";
import Tool from "./tool";

const PENS = {
  pen_blue: {
    color: "#0000FF",
    weight: 1,
  },
  pen_red: {
    color: "#FF0000",
    weight: 1,
  },
  pen_black: {
    color: "#000000",
    weight: 1,
  },
  highlight_yellow: {
    color: "#FFFF0033",
    weight: 20,
  },
  highlight_green: {
    color: "#00FF0033",
    weight: 20,
  },
  whiteout: {
    color: "#FFFFFF",
    weight: 20,
  },
};

export type PenType = keyof typeof PENS;

export default class DrawTool implements Tool {
  state_manager: StateManager;
  stroke: Stroke | null;
  offset: Point = { x: 0, y: 0 };
  type: PenType;

  constructor(state_manager: StateManager, type: PenType) {
    this.state_manager = state_manager;
    this.stroke = null;
    this.type = type;
  }

  onpointerdown(position: Point) {
    const props = PENS[this.type];
    const { stroke, offset } = this.state_manager.createNewStroke(
      position,
      props,
    );
    this.state_manager.addPointToStroke(stroke, Vec.sub(position, offset));
    this.stroke = stroke;
    this.offset = offset;
  }

  onpointermove(position: Point) {
    if (this.stroke == null) return;
    this.state_manager.addPointToStroke(
      this.stroke,
      Vec.sub(position, this.offset),
    );
  }

  onpointerup() {
    this.stroke = null;
  }
}
