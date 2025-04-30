import { Point } from "geom/point";
import { Vec } from "geom/vec";
import Render, { dashedStroke } from "render";
import StateManager, { CardInstance, Id } from "state";

export default class Selection {
  state_manager: StateManager;
  selectedCardInstance: Id<CardInstance> | null = null;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
    this.selectedCardInstance = null;
  }

  clear(): void {
    this.selectedCardInstance = null;
  }

  active(): boolean {
    return this.selectedCardInstance !== null;
  }

  selectAtPosition(position: Point) {
    const found = this.state_manager.findCardInstanceAt(position);
    if (found) {
      this.selectedCardInstance = found.id;
    } else {
      this.selectedCardInstance = null;
    }
  }

  drag(delta: Vec) {
    const instance = this.state_manager.getCardInstance(
      this.selectedCardInstance!,
    );
    if (instance) {
      const newPos = Vec.add(instance, delta);
      this.state_manager.moveCardInstance(instance.id, newPos);
    }
  }

  render(r: Render) {
    // Selected Card
    if (this.selectedCardInstance) {
      const inst = this.state_manager.getCardInstance(
        this.selectedCardInstance,
      )!;

      const card = this.state_manager.getCard(inst.cardId)!;
      r.round_rect(
        inst.x - 4,
        inst.y - 4,
        card.width + 8,
        card.height + 8,
        4,
        dashedStroke("blue", 1, [10, 10]),
      );
    }
  }
}
