import { Point } from "geom/point";
import { Vec } from "geom/vec";
import Render, { dashedStroke, fill, fillAndStroke } from "render";
import StateManager from "state";

const OPTIONS = ["copy", "transclude", "delete"];

export default class Selection {
  state_manager: StateManager;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.state_manager.selectedCardInstance = null;
  }

  clear(): void {
    this.state_manager.selectedCardInstance = null;
  }

  active(): boolean {
    return this.state_manager.selectedCardInstance !== null;
  }

  selectAtPosition(position: Point) {
    const found = this.state_manager.findCardInstanceAt(position);
    if (found) {
      this.state_manager.selectedCardInstance = found.id;
    } else {
      this.state_manager.selectedCardInstance = null;
    }
  }

  click({ x, y }: Point) {
    console.log("click", x, y);
    if (!this.active()) return;
    const inst = this.state_manager.getCardInstance(
      this.state_manager.selectedCardInstance!
    )!;

    if (
      x < inst.x ||
      x > inst.x + OPTIONS.length * 40 ||
      y < inst.y - 50 ||
      y > inst.y - 50 + 40
    ) {
      return false;
    }

    const option = OPTIONS[Math.floor((x - inst.x) / 40)];

    console.log(option);
    if (option === "copy") {
      const cardCopyId = this.state_manager.copyCard(inst.cardId);
      console.log("copy", cardCopyId);
      const newCardInstance = this.state_manager.createCardInstance({
        cardId: cardCopyId,
        position: Vec.add(inst, { x: 20, y: 20 }),
      });
      this.state_manager.selectedCardInstance = newCardInstance.id;
    } else if (option === "transclude") {
      const newCardInstance = this.state_manager.createCardInstance({
        cardId: inst.cardId,
        position: Vec.add(inst, { x: 20, y: 20 }),
        linkToCardInstanceId: inst.id,
      });
      this.state_manager.selectedCardInstance = newCardInstance.id;
    } else if (option === "delete") {
      this.state_manager.deleteCardInstance(
        this.state_manager.selectedCardInstance!
      );
      this.state_manager.selectedCardInstance = null;
    }
  }

  drag(delta: Vec) {
    const instance = this.state_manager.getCardInstance(
      this.state_manager.selectedCardInstance!
    );
    if (instance) {
      const newPos = Vec.add(instance, delta);
      this.state_manager.moveCardInstance(instance.id, newPos);
    }
  }

  render(r: Render) {
    // Selected Card
    if (this.active()) {
      const inst = this.state_manager.getCardInstance(
        this.state_manager.selectedCardInstance!
      )!;

      // Draw the selection box
      const card = this.state_manager.getCard(inst.cardId)!;
      r.round_rect(
        inst.x - 4,
        inst.y - 4,
        card.width + 8,
        card.height + 8,
        4,
        dashedStroke("blue", 1, [10, 10])
      );

      // Draw selection the menu
      const p = Vec.add(inst, { x: 0, y: -50 });
      r.round_rect(p.x + 2, p.y + 2, OPTIONS.length * 40, 40, 3, fill("#0001"));
      r.round_rect(
        p.x,
        p.y,

        OPTIONS.length * 40,
        40,
        3,
        fillAndStroke("#FFF", "#0002", 1)
      );

      for (let i = 0; i < OPTIONS.length; i++) {
        r.image("/img/" + OPTIONS[i] + ".png", { x: p.x + i * 40, y: p.y });
      }
    }
  }
}
