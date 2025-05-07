import StateManager from "state";
import Tool from "tool/tool";
import CreateCardTool from "tool/createcard";
import DrawTool, { PenType } from "tool/draw";
import EraseTool from "tool/erase";
import SelectTool from "tool/select";
import CreateCalendarCardTool from "tool/createcalendarcard";

import Toolbar from "toolbar";

import Selection from "selection";
import CreateTextTool from "tool/text";

export default class Input {
  state_manager: StateManager;
  toolbar: Toolbar;
  selection: Selection;
  tool: Tool;

  dragging: boolean = false;

  constructor(
    state_manager: StateManager,
    selection: Selection,
    toolbar: Toolbar
  ) {
    this.state_manager = state_manager;
    this.toolbar = toolbar;
    this.selection = selection;
    this.tool = new DrawTool(state_manager, "pen_black");

    document.addEventListener("pointerdown", (e) => {
      // @ts-ignore: Ignore events that aren't on the canvas
      if (e.target.nodeName !== "CANVAS") {
        return;
      }

      // handle transclusion link click
      if (e.metaKey) {
        const inst = this.state_manager.findCardInstanceAt({
          x: e.clientX,
          y: e.clientY,
        });

        if (!inst || !inst.linkToCardInstanceId) return;

        const linkedInstance = this.state_manager.getCardInstance(
          inst.linkToCardInstanceId
        );

        if (!linkedInstance) return;

        const card = this.state_manager.getCard(inst.cardId)!;
        const isInTopLeft =
          e.clientX - inst.x - card.width + 40 > 0 && e.clientY - inst.y < 40;

        // is click in the top right corner of the card?
        if (isInTopLeft) {
          const linkedInstance = this.state_manager.getCardInstance(
            inst.linkToCardInstanceId
          );

          if (linkedInstance) {
            this.state_manager.gotoPage(linkedInstance.pageId);
            return;
          }
        }
      }

      // Handle Toolbar Click
      if (this.toolbar.click({ x: e.clientX, y: e.clientY })) {
        const tool = this.toolbar.getCurrentTool();
        if (
          [
            "pen_black",
            "pen_red",
            "pen_blue",
            "highlight_yellow",
            "highlight_green",
            "whiteout",
          ].includes(tool)
        ) {
          this.tool = new DrawTool(this.state_manager, tool as PenType);
        } else if (tool == "card") {
          this.tool = new CreateCardTool(this.state_manager);
        } else if (tool == "calendar") {
          this.tool = new CreateCalendarCardTool(this.state_manager);
        } else if (tool == "eraser") {
          this.tool = new EraseTool(this.state_manager);
        } else if (tool == "select") {
          this.tool = new SelectTool(this.state_manager, this.selection);
        } else if (tool == "text") {
          this.tool = new CreateTextTool(this.state_manager, this.selection);
        }
        return;
      }

      // Handle regular pointer
      this.tool.onpointerdown({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener(
      "pointermove",
      (e) => {
        e.preventDefault();
        this.tool.onpointermove({ x: e.clientX, y: e.clientY });
      },
      { passive: false }
    );

    window.addEventListener("pointerup", (e) => {
      this.tool.onpointerup({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.selection.clear();
      } else if (e.key === "ArrowRight") {
        this.state_manager.gotoNextPage();
      } else if (e.key === "ArrowLeft") {
        this.state_manager.gotoPrevPage();
      }
    });
  }
}
