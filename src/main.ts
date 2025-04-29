import { DocHandle, DocumentId, Repo } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import tick from "tick";
import Render from "render";
import StateManager, { createStateDoc, State } from "state";
import { syncAllCalendars, getAllCalendars } from "./googlecalendar";

import Input from "input";

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
  storage: new IndexedDBStorageAdapter(),
});

// Get document ID from URL hash if available
let documentId = window.location.hash.slice(1) as DocumentId;

let handle: DocHandle<State>;

if (!documentId) {
  handle = createStateDoc(repo);
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

const input = new Input(state_manager);

tick((_) => {
  render.clear();

  state_manager.render(render);
});
