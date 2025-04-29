import { type DataTypeImplementation, initFrom } from "@patchwork/sdk";
import { HasVersionControlMetadata } from "@patchwork/sdk/versionControl";
import { getNewEmptyState, State } from "state";

// SCHEMA

export type Doc = HasVersionControlMetadata<unknown, unknown> & State;

// FUNCTIONS

export const markCopy = (doc: Doc) => {
  doc.title = "Copy of " + doc.title;
};

const setTitle = async (doc: Doc, title: string) => {
  doc.title = title;
};

const getTitle = async (doc: Doc) => {
  return doc.title || "Sketchy Calendar";
};

export const init = (doc: Doc) => {
  initFrom(doc, getNewEmptyState());
};

export const dataType: DataTypeImplementation<Doc, unknown, unknown> = {
  init,
  getTitle,
  setTitle,
  markCopy,
};
