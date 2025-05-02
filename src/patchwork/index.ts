import { makeTool, ToolDescription, LoadableDataType } from "@patchwork/sdk";
import { Doc } from "./datatype.ts";
import "./style.css";

export const dataType: LoadableDataType<Doc> = {
  type: "patchwork:dataType",
  id: "sketchy-calendar",
  name: "Sketchy Calendar",
  icon: "Calendar",
  async load() {
    const { dataType } = await import("./datatype.ts");
    return dataType;
  },
};

export const tools: ToolDescription[] = [
  {
    type: "patchwork:tool",
    id: "sketchy-calendar",
    name: "Sketchy Calendar",
    icon: "Calendar",
    supportedDataTypes: ["sketchy-calendar"],
    async load() {
      const { Tool } = await import("./tool.ts");
      return makeTool({ EditorComponent: Tool });
    },
  },
];
