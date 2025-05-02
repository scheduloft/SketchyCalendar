import { EditorProps } from "@patchwork/sdk";
import { createElement } from "react";
import { State } from "state";

export const Tool: React.FC<EditorProps<State, string>> = ({ docUrl }) => {
  return createElement("iframe", {
    style: { width: "100%", height: "100%" },
    key: docUrl, // just remount the iframe becaue index.html doesn't handle url changes
    src:
      "https://patchwork.inkandswitch.com/automerge/automerge:22ubbbsJkuLvbjcFNjzHNAQe17tj/dist/index.html#" +
      docUrl,
  });
};
