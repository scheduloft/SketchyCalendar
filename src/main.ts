import { DocHandle, DocumentId, Repo } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import Render from "render";
import StateManager, { getNewEmptyState, State } from "state";
import Toolbar from "toolbar";
import Selection from "selection";
import tick from "tick";
import { getEventsOnDay, syncAllCalendars } from "./googlecalendar";
import "./index.css";

import Input from "input";

// hack detect ipad screen
if (window.screen.width == 1016 && window.screen.height == 746) {
  document.body.classList.add("no-cursor");
}

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
  storage: new IndexedDBStorageAdapter(),
});

// Get document ID from URL hash if available
let documentId = window.location.hash.slice(1) as DocumentId;

let handle: DocHandle<State>;

if (!documentId) {
  handle = repo.create(getNewEmptyState());
  documentId = handle.documentId;

  // Update URL with the new document ID
  window.location.hash = documentId;
} else {
  handle = repo.find<State>(documentId);
}

syncAllCalendars();

console.log(await handle.doc());

const render = new Render();

const state_manager = new StateManager(handle);
const toolbar = new Toolbar();
const selection = new Selection(state_manager);

new Input(state_manager, selection, toolbar);

//const events =
const today = new Date();
const events = getEventsOnDay({
  calendarIds: [""],
  date: today,
});
console.log(events);

tick((_) => {
  render.clear();

  state_manager.render(render);
  toolbar.render(render);
  selection.render(render);
});
