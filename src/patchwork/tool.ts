import { EditorProps } from "@patchwork/sdk";
import StateManager, { State } from "state";
import { createElement, useEffect, useState } from "react";
import { useDocHandle } from "@automerge/automerge-repo-react-hooks";
import Render from "render";
import Input from "input";
import tick from "tick";

export const Tool: React.FC<EditorProps<State, string>> = ({ docUrl }) => {
  const handle = useDocHandle<State>(docUrl);
  const [container, setContainer] = useState<HTMLDivElement>();

  useEffect(() => {
    if (!container || !handle) {
      return;
    }

    const render = new Render(container);
    const state_manager = new StateManager(handle);

    new Input(state_manager);

    const stop = tick((_) => {
      render.clear();
      state_manager.render(render);
    });

    return () => {
      stop();
      render.destroy();
    };
  }, [handle, container]);

  return createElement("div", {
    style: { width: "100%", height: "100%" },
    ref: setContainer,
  });
};
