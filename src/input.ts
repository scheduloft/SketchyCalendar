import StateManager from "state";
import Tool from "tool/tool";
import CreateCardTool from "tool/createcard";
import DrawTool from "tool/draw";
import EraseTool from "tool/erase";
import CreateCalendarCardTool from "tool/createcalendarcard";

import Toolbar from "toolbar";

import Selection from "selection";

export default class Input {
  state_manager: StateManager;
  toolbar: Toolbar;
  selection: Selection;
  tool: Tool;

  dragging: boolean = false;

  constructor(
    state_manager: StateManager,
    selection: Selection,
    toolbar: Toolbar,
  ) {
    this.state_manager = state_manager;
    this.toolbar = toolbar;
    this.selection = selection;
    this.tool = new DrawTool(state_manager);

    window.addEventListener("pointerdown", (e) => {
      // Handle Toolbar Click
      if (this.toolbar.click({ x: e.clientX, y: e.clientY })) {
        const tool = this.toolbar.getCurrentTool();
        if (tool == "draw") {
          this.tool = new DrawTool(this.state_manager);
        } else if (tool == "card") {
          this.tool = new CreateCardTool(this.state_manager);
        } else if (tool == "calendar") {
          this.tool = new CreateCalendarCardTool(this.state_manager);
        } else if (tool == "eraser") {
          this.tool = new EraseTool(this.state_manager);
        }
        return;
      }

      // Handle Selection
      if (e.shiftKey) {
        this.selection.selectAtPosition({ x: e.clientX, y: e.clientY });
        return;
      }

      if (this.selection.active()) {
        this.selection.click({ x: e.clientX, y: e.clientY });
        this.dragging = true;
        return;
      }

      // Handle regular pointer
      this.tool.onpointerdown({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("pointermove", (e) => {
      if (this.selection.active() && this.dragging) {
        this.selection.drag({ x: e.movementX, y: e.movementY });
      } else {
        this.tool.onpointermove({ x: e.clientX, y: e.clientY });
      }
    });

    window.addEventListener("pointerup", (e) => {
      if (this.selection.active()) {
        this.dragging = false;
      } else {
        this.tool.onpointerup({ x: e.clientX, y: e.clientY });
      }
    });

    window.addEventListener("keypress", (e) => {});
  }
}
