import Tool from "./tool";
import { Point } from "geom/point";
import StateManager, { Id, Card } from "state";
import Selection from "selection";

export default class CreateTextTool implements Tool {
  state_manager: StateManager;
  selection: Selection;

  constructor(state_manager: StateManager, selection: Selection) {
    this.state_manager = state_manager;
    this.selection = selection;
  }

  onpointerdown(position: Point) {
    const ref = this.state_manager.createNewText(position);
    this.selection.selectText(ref);
  }

  onpointermove(position: Point) {}

  onpointerup() {}
}
