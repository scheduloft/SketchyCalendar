import StateManager, { TextElementReference } from "state";

export default class TextInput {
  domNode: HTMLInputElement | null = null;
  state_manager: StateManager;
  selectedTextElement: TextElementReference | null = null;

  constructor(state_manager: StateManager) {
    this.state_manager = state_manager;
  }

  open(selectedTextElement: TextElementReference) {
    this.close();

    const value = this.state_manager.getTextElementValue(selectedTextElement);

    this.selectedTextElement = selectedTextElement;

    this.domNode = document.createElement("input");
    this.domNode.value = value;
    this.domNode.addEventListener("input", (e) => {
      console.log(e.target.value);
      this.state_manager.updateTextElement(selectedTextElement, e.target.value);
    });

    this.domNode.addEventListener("keydown", (e) => {
      if (e.code == "Enter") {
        this.close();
      }
    });
    this.domNode.addEventListener("blur", (_) => {
      this.close();
    });

    const position =
      this.state_manager.getTextElementPosition(selectedTextElement);
    this.domNode.style.left = `${position.x}px`;
    this.domNode.style.top = `${position.y - 18}px`;

    this.domNode.focus();

    document.body.append(this.domNode);
  }

  close() {
    if (this.domNode) {
      this.domNode.remove();
    }
  }
}
