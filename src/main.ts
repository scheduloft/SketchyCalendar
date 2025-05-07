import { DocHandle, DocumentId, Repo } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import Render from "render";
import Selection from "selection";
import StateManager, { getNewEmptyState, State } from "state";
import tick from "tick";
import Toolbar from "toolbar";
import { Calendar } from "./calendar";
import "./index.css";

import Input from "input";
import TextInput from "textinput";

// hack detect ipad screen
if (window.screen.width == 1016 && window.screen.height == 746) {
  document.body.classList.add("no-cursor");
}

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
  storage: new IndexedDBStorageAdapter(),
});

let calenderDocUrl: DocumentId | null = localStorage.getItem(
  "calendarDocUrl"
) as DocumentId | null;

if (!calenderDocUrl) {
  let url = prompt(
    "Please enter your calendar doc url. If you don't have one you can ask Paul"
  );

  let maybeCalendarDoc = (await repo.find<Calendar>(url as DocumentId))?.doc();

  if (
    url &&
    maybeCalendarDoc &&
    typeof maybeCalendarDoc.calendars === "object" &&
    typeof maybeCalendarDoc.events === "object"
  ) {
    calenderDocUrl = url as DocumentId;
    localStorage.setItem("calendarDocUrl", url);
  }
}

const calendarDocHandle = await repo.find<Calendar>(
  calenderDocUrl as DocumentId
);

// Get document ID from URL hash if available
let documentId = window.location.hash.slice(1) as DocumentId;

let stateDocHandle: DocHandle<State>;

if (!documentId) {
  stateDocHandle = repo.create(getNewEmptyState());
  documentId = stateDocHandle.documentId;

  // Update URL with the new document ID
  window.location.hash = documentId;
} else {
  stateDocHandle = await repo.find<State>(documentId);
}

const render = new Render();

const state_manager = new StateManager(stateDocHandle, calendarDocHandle);
const toolbar = new Toolbar();
const text_input = new TextInput(state_manager);
const selection = new Selection(state_manager, text_input);

new Input(state_manager, selection, toolbar);

tick((_) => {
  render.clear();

  state_manager.render(render);
  toolbar.render(render);
  selection.render(render);
});
