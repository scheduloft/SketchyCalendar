import tick from "tick";
import Render from "render";
import StateManager from "state";
import Input from "input";

import { syncAllCalendars, getAllCalendars } from "./GoogleCalendar";

syncAllCalendars();

console.log(getAllCalendars());

const render = new Render();
const state_manager = new StateManager();

const input = new Input(state_manager);

tick((_) => {
  render.clear();

  state_manager.render(render);
});
