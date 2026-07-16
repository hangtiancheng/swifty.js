// Users who only use Preact for SSR might not specify "dom" in their lib in tsconfig.json
/// <reference lib="dom" />

import { Component, ComponentType, FunctionComponent, VNode } from ".";

type Defaultize<Props, Defaults> =
  // Distribute over unions
  Props extends any // Make any properties included in Default optional
    ? Partial<Pick<Props, Extract<keyof Props, keyof Defaults>>> & // Include the remaining properties from Props
        Pick<Props, Exclude<keyof Props, keyof Defaults>>
    : never;

type Booleanish = boolean | "true" | "false";

// Remove when bumping TS minimum to >5.2

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent) */
interface ToggleEvent extends Event {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent/newState) */
  readonly newState: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent/oldState) */
  readonly oldState: string;
}

declare var ToggleEvent: {
  prototype: ToggleEvent;
  new (type: string, eventInitDict?: ToggleEventInit): ToggleEvent;
};

interface ToggleEventInit extends EventInit {
  newState?: string;
  oldState?: string;
}

// End TS >5.2

/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent) */
interface CommandEvent extends Event {
  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent/source) */
  readonly source: Element | null;
  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent/command) */
  readonly command: string;
}

declare var CommandEvent: {
  prototype: CommandEvent;
  new (type: string, eventInitDict?: CommandEventInit): CommandEvent;
};

interface CommandEventInit extends EventInit {
  source: Element | null;
  command: string;
}

/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/SnapEvent) */
interface SnapEvent extends Event {
  readonly snapTargetBlock: Element | null;
  readonly snapTargetInline: Element | null;
}

declare var SnapEvent: {
  prototype: SnapEvent;
  new (type: string, eventInitDict?: SnapEventInit): SnapEvent;
};

interface SnapEventInit extends EventInit {
  snapTargetBlock?: Element | null;
  snapTargetInline?: Element | null;
}

export namespace JSXInternal {
  export type LibraryManagedAttributes<Component, Props> = Component extends {
    defaultProps: infer Defaults;
  }
    ? Defaultize<Props, Defaults>
    : Props;

  export interface IntrinsicAttributes {
    key?: any;
  }

  export type ElementType<P = any> =
    | {
        [K in keyof IntrinsicElements]: P extends IntrinsicElements[K]
          ? K
          : never;
      }[keyof IntrinsicElements]
    | ComponentType<P>;
  export interface Element extends VNode<any> {}
  export type ElementClass = Component<any, any> | FunctionComponent<any>;

  export interface ElementAttributesProperty {
    props: any;
  }

  export interface ElementChildrenAttribute {
    children: any;
  }
}
