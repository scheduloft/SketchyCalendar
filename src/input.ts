import StateManager from "state";
import Tool from "tool/tool";
import CreateCardTool from "tool/createcard";
import DrawTool from "tool/draw";
import CopyCardTool from "tool/copycard";
import EraseTool from "tool/erase";
import CreateCalendarCardTool from "tool/createcalendarcard";

export default class Input {
  state_manager: StateManager;
  tool: Tool;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.tool = new DrawTool(state_manager);

    window.addEventListener("pointerdown", (e) => {
      this.tool.onpointerdown({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("pointermove", (e) => {
      this.tool.onpointermove({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("pointerup", (e) => {
      this.tool.onpointerup({ x: e.clientX, y: e.clientY });
      this.tool = new DrawTool(this.state_manager);
    });

    window.addEventListener("keypress", (e) => {
      if (e.key == "c") {
        this.tool = new CreateCardTool(this.state_manager);
      } else if (e.key == "d") {
        this.tool = new DrawTool(this.state_manager);
      } else if (e.key == "t") {
        this.tool = new CopyCardTool(this.state_manager);
      } else if (e.key == "e") {
        this.tool = new EraseTool(this.state_manager);
      } else if (e.key == "k") {
        this.tool = new CreateCalendarCardTool(this.state_manager);
      }
    });
  }
}
