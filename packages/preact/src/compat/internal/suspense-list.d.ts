// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
// @ts-ignore
import { Component, ComponentChild, ComponentChildren } from "../../index.d.ts";

//
// SuspenseList
// -----------------------------------

export interface SuspenseListProps {
  children?: ComponentChildren;
  revealOrder?: "forwards" | "backwards" | "together";
}

export class SuspenseList extends Component<SuspenseListProps> {
  render(): ComponentChild;
}
