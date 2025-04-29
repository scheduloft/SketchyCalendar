import StateManager from "state";
import Tool from "tool/tool";
import CreateCardTool from "tool/createcard";
import DrawTool from "tool/draw";
import CopyCardTool from "tool/copycard";
import EraseTool from "tool/erase";
import CreateCalendarCardTool from "tool/createcalendarcard";

import Toolbar from "toolbar";

export default class Input {
  state_manager: StateManager;
  toolbar: Toolbar;
  tool: Tool;

  constructor(state_manager: StateManager, toolbar: Toolbar) {
    this.state_manager = state_manager;
    this.toolbar = toolbar;
    this.tool = new DrawTool(state_manager);

    window.addEventListener("pointerdown", (e) => {
      if (this.toolbar.click({ x: e.clientX, y: e.clientY })) {
        const tool = this.toolbar.getCurrentTool();
        if (tool == "draw") {
          this.tool = new DrawTool(this.state_manager);
        } else if (tool == "card") {
          this.tool = new CreateCardTool(this.state_manager);
        } else if (tool == "calendar") {
          this.tool = new CreateCalendarCardTool(this.state_manager);
        }

        return;
      }
      this.tool.onpointerdown({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("pointermove", (e) => {
      this.tool.onpointermove({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("pointerup", (e) => {
      this.tool.onpointerup({ x: e.clientX, y: e.clientY });
      //this.tool = new DrawTool(this.state_manager);
      //this.toolbar.reset();
    });

    window.addEventListener("keypress", (e) => {});
  }
}
