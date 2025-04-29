import Render, { fillAndStroke, fill } from "./render";

export const TOOLS = ["draw", "card", "calendar"];

export default class Toolbar {
  activeTool: number = 0;

  render(r: Render) {
    r.round_rect(10 + 2, 10 + 2, 40, TOOLS.length * 40, 3, fill("#0001"));
    r.round_rect(
      10,
      10,
      40,
      TOOLS.length * 40,
      3,
      fillAndStroke("#FFF", "#0002", 1),
    );

    r.round_rect(
      10 + 2,
      10 + 2 + this.activeTool * 40,
      36,
      36,
      3,
      fill("#BBBBFF"),
    );

    for (let i = 0; i < TOOLS.length; i++) {
      r.image("/img/" + TOOLS[i] + ".png", { x: 10, y: 10 + i * 40 });
    }
  }

  click({ x, y }: { x: number; y: number }): boolean {
    if (x < 10 || x > 50 || y < 10 || y > TOOLS.length * 40) return false;
    this.activeTool = Math.floor((y - 10) / 40);
    return true;
  }

  getCurrentTool(): string {
    return TOOLS[this.activeTool];
  }

  reset() {
    this.activeTool = 0;
  }
}
