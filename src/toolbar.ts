import Render, { fillAndStroke, fill } from "./render";

export const TOOLS = [
  ["select"],
  ["pen_black", "pen_blue", "pen_red", "highlight_yellow", "highlight_green"],
  ["eraser", "whiteout"],
  ["text", "card", "calendar"],
];

export default class Toolbar {
  activeSection: number = 1;
  activeTool: number = 0;

  render(r: Render) {
    const p_x = 10;
    let p_y = 10;

    for (let i = 0; i < TOOLS.length; i++) {
      const section = TOOLS[i];
      r.round_rect(p_x + 2, p_y + 2, 40, section.length * 40, 3, fill("#0001"));
      r.round_rect(
        p_x,
        p_y,
        40,
        section.length * 40,
        3,
        fillAndStroke("#FFF", "#0002", 1)
      );

      // render tool hightlight
      if (this.activeSection == i) {
        r.round_rect(
          p_x + 2,
          p_y + 2 + this.activeTool * 40,
          36,
          36,
          3,
          fill("#00000020")
        );
      }

      for (let i = 0; i < section.length; i++) {
        r.image("./img/" + section[i] + ".png", {
          x: p_x,
          y: p_y + i * 40,
        });
      }

      p_y += section.length * 40 + 4;
    }
  }

  click({ x, y }: { x: number; y: number }): boolean {
    const p_x = 10;
    let p_y = 10;
    for (let i = 0; i < TOOLS.length; i++) {
      const section = TOOLS[i];
      if (x < p_x || x > p_x + 40 || y < p_y || y > p_y + section.length * 40) {
        p_y += section.length * 40 + 4;
        continue;
      }

      this.activeSection = i;
      this.activeTool = Math.floor((y - p_y) / 40);
      return true;
    }

    return false;
  }

  getCurrentTool(): string {
    return TOOLS[this.activeSection][this.activeTool];
  }

  reset() {
    this.activeSection = 0;
    this.activeTool = 0;
  }
}
