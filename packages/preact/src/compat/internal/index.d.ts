/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-ignore
import * as _hooks from "../../hooks/index.d.ts";
// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
// @ts-ignore
import * as preact from "../../index.d.ts";
// @ts-ignore
import { JSXInternal } from "../../jsx.d.ts";
// @ts-ignore
import * as _Suspense from "./suspense.d.ts";
// @ts-ignore
import * as _SuspenseList from "./suspense-list.d.ts";

// export default React;
export = React;
export as namespace React;
declare namespace React {
  // Export JSX
  export import JSX = JSXInternal;

  // Hooks
  export import CreateHandle = _hooks.CreateHandle;
  export import EffectCallback = _hooks.EffectCallback;
  export import Inputs = _hooks.Inputs;
  export import PropRef = _hooks.PropRef;
  export import Reducer = _hooks.Reducer;
  export import Dispatch = _hooks.Dispatch;
  export import SetStateAction = _hooks.StateUpdater;
  export import useCallback = _hooks.useCallback;
  export import useContext = _hooks.useContext;
  export import useDebugValue = _hooks.useDebugValue;
  export import useEffect = _hooks.useEffect;
  export import useImperativeHandle = _hooks.useImperativeHandle;
  export import useId = _hooks.useId;
  export import useLayoutEffect = _hooks.useLayoutEffect;
  export import useMemo = _hooks.useMemo;
  export import useReducer = _hooks.useReducer;
  export import useRef = _hooks.useRef;
  export import useState = _hooks.useState;
  // React 18 hooks
  export import useInsertionEffect = _hooks.useLayoutEffect;
  export function useTransition(): [false, typeof startTransition];
  export function useDeferredValue<T = any>(val: T): T;
  export function useSyncExternalStore<T>(
    subscribe: (flush: () => void) => () => void,
    getSnapshot: () => T,
  ): T;

  // Preact Defaults
  export import Context = preact.Context;
  export import ContextType = preact.ContextType;
  export import RefObject = preact.RefObject;
  export import Component = preact.Component;
  export import FunctionComponent = preact.FunctionComponent;
  export import ComponentType = preact.ComponentType;
  export import ComponentClass = preact.ComponentClass;
  export import FC = preact.FunctionComponent;
  export import createContext = preact.createContext;
  export import Ref = preact.Ref;
  export import createRef = preact.createRef;
  export import Fragment = preact.Fragment;
  export import createElement = preact.createElement;
  export import cloneElement = preact.cloneElement;
  export import ComponentProps = preact.ComponentProps;
  export import ReactNode = preact.ComponentChild;
  export import ReactElement = preact.VNode;
  export import Consumer = preact.Consumer;
  export import ErrorInfo = preact.ErrorInfo;
  export import Key = preact.Key;

  // Suspense
  export import Suspense = _Suspense.Suspense;
  export import lazy = _Suspense.lazy;
  export import SuspenseList = _SuspenseList.SuspenseList;

  // Compat
  export import StrictMode = preact.Fragment;
  export const version: string;
  export function startTransition(cb: () => void): void;

  // HTML
  export interface HTMLAttributes<
    T extends EventTarget,
  > extends JSXInternal.HTMLAttributes<T> {}
  export interface HTMLProps<T extends EventTarget>
    extends JSXInternal.AllHTMLAttributes<T>, preact.ClassAttributes<T> {}
  export interface AllHTMLAttributes<
    T extends EventTarget,
  > extends JSXInternal.AllHTMLAttributes<T> {}
  export import DetailedHTMLProps = JSXInternal.DetailedHTMLProps;
  export import CSSProperties = JSXInternal.CSSProperties;

  export interface SVGProps<T extends EventTarget>
    extends JSXInternal.SVGAttributes<T>, preact.ClassAttributes<T> {}

  interface SVGAttributes<
    T extends EventTarget = SVGElement,
  > extends JSXInternal.SVGAttributes<T> {}

  interface ReactSVG extends JSXInternal.IntrinsicSVGElements {}

  export import AriaAttributes = JSXInternal.AriaAttributes;

  export import HTMLAttributeReferrerPolicy = JSXInternal.HTMLAttributeReferrerPolicy;
  export import HTMLAttributeAnchorTarget = JSXInternal.HTMLAttributeAnchorTarget;
  export import HTMLInputTypeAttribute = JSXInternal.HTMLInputTypeAttribute;
  export import HTMLAttributeCrossOrigin = JSXInternal.HTMLAttributeCrossOrigin;

  export import AnchorHTMLAttributes = JSXInternal.AnchorHTMLAttributes;
  export import AudioHTMLAttributes = JSXInternal.AudioHTMLAttributes;
  export import AreaHTMLAttributes = JSXInternal.AreaHTMLAttributes;
  export import BaseHTMLAttributes = JSXInternal.BaseHTMLAttributes;
  export import BlockquoteHTMLAttributes = JSXInternal.BlockquoteHTMLAttributes;
  export import ButtonHTMLAttributes = JSXInternal.ButtonHTMLAttributes;
  export import CanvasHTMLAttributes = JSXInternal.CanvasHTMLAttributes;
  export import ColHTMLAttributes = JSXInternal.ColHTMLAttributes;
  export import ColgroupHTMLAttributes = JSXInternal.ColgroupHTMLAttributes;
  export import DataHTMLAttributes = JSXInternal.DataHTMLAttributes;
  export import DetailsHTMLAttributes = JSXInternal.DetailsHTMLAttributes;
  export import DelHTMLAttributes = JSXInternal.DelHTMLAttributes;
  export import DialogHTMLAttributes = JSXInternal.DialogHTMLAttributes;
  export import EmbedHTMLAttributes = JSXInternal.EmbedHTMLAttributes;
  export import FieldsetHTMLAttributes = JSXInternal.FieldsetHTMLAttributes;
  export import FormHTMLAttributes = JSXInternal.FormHTMLAttributes;
  export import IframeHTMLAttributes = JSXInternal.IframeHTMLAttributes;
  export import ImgHTMLAttributes = JSXInternal.ImgHTMLAttributes;
  export import InsHTMLAttributes = JSXInternal.InsHTMLAttributes;
  export import InputHTMLAttributes = JSXInternal.InputHTMLAttributes;
  export import KeygenHTMLAttributes = JSXInternal.KeygenHTMLAttributes;
  export import LabelHTMLAttributes = JSXInternal.LabelHTMLAttributes;
  export import LiHTMLAttributes = JSXInternal.LiHTMLAttributes;
  export import LinkHTMLAttributes = JSXInternal.LinkHTMLAttributes;
  export import MapHTMLAttributes = JSXInternal.MapHTMLAttributes;
  export import MenuHTMLAttributes = JSXInternal.MenuHTMLAttributes;
  export import MediaHTMLAttributes = JSXInternal.MediaHTMLAttributes;
  export import MetaHTMLAttributes = JSXInternal.MetaHTMLAttributes;
  export import MeterHTMLAttributes = JSXInternal.MeterHTMLAttributes;
  export import QuoteHTMLAttributes = JSXInternal.QuoteHTMLAttributes;
  export import ObjectHTMLAttributes = JSXInternal.ObjectHTMLAttributes;
  export import OlHTMLAttributes = JSXInternal.OlHTMLAttributes;
  export import OptgroupHTMLAttributes = JSXInternal.OptgroupHTMLAttributes;
  export import OptionHTMLAttributes = JSXInternal.OptionHTMLAttributes;
  export import OutputHTMLAttributes = JSXInternal.OutputHTMLAttributes;
  export import ParamHTMLAttributes = JSXInternal.ParamHTMLAttributes;
  export import ProgressHTMLAttributes = JSXInternal.ProgressHTMLAttributes;
  export import SlotHTMLAttributes = JSXInternal.SlotHTMLAttributes;
  export import ScriptHTMLAttributes = JSXInternal.ScriptHTMLAttributes;
  export import SelectHTMLAttributes = JSXInternal.SelectHTMLAttributes;
  export import SourceHTMLAttributes = JSXInternal.SourceHTMLAttributes;
  export import StyleHTMLAttributes = JSXInternal.StyleHTMLAttributes;
  export import TableHTMLAttributes = JSXInternal.TableHTMLAttributes;
  export import TextareaHTMLAttributes = JSXInternal.TextareaHTMLAttributes;
  export import TdHTMLAttributes = JSXInternal.TdHTMLAttributes;
  export import ThHTMLAttributes = JSXInternal.ThHTMLAttributes;
  export import TimeHTMLAttributes = JSXInternal.TimeHTMLAttributes;
  export import TrackHTMLAttributes = JSXInternal.TrackHTMLAttributes;
  export import VideoHTMLAttributes = JSXInternal.VideoHTMLAttributes;

  // Events
  export import TargetedEvent = preact.TargetedEvent;
  export import ChangeEvent = preact.TargetedEvent;
  export import ClipboardEvent = preact.TargetedClipboardEvent;
  export import CompositionEvent = preact.TargetedCompositionEvent;
  export import DragEvent = preact.TargetedDragEvent;
  export import PointerEvent = preact.TargetedPointerEvent;
  export import FocusEvent = preact.TargetedFocusEvent;
  export import FormEvent = preact.TargetedEvent;
  export import InvalidEvent = preact.TargetedEvent;
  export import KeyboardEvent = preact.TargetedKeyboardEvent;
  export import MouseEvent = preact.TargetedMouseEvent;
  export import TouchEvent = preact.TargetedTouchEvent;
  export import UIEvent = preact.TargetedUIEvent;
  export import AnimationEvent = preact.TargetedAnimationEvent;
  export import TransitionEvent = preact.TargetedTransitionEvent;

  // Event Handler Types
  export import EventHandler = preact.EventHandler;
  export import ChangeEventHandler = preact.GenericEventHandler;
  export import ClipboardEventHandler = preact.ClipboardEventHandler;
  export import CompositionEventHandler = preact.CompositionEventHandler;
  export import DragEventHandler = preact.DragEventHandler;
  export import PointerEventHandler = preact.PointerEventHandler;
  export import FocusEventHandler = preact.FocusEventHandler;
  export import FormEventHandler = preact.GenericEventHandler;
  export import InvalidEventHandler = preact.GenericEventHandler;
  export import KeyboardEventHandler = preact.KeyboardEventHandler;
  export import MouseEventHandler = preact.MouseEventHandler;
  export import TouchEventHandler = preact.TouchEventHandler;
  export import UIEventHandler = preact.UIEventHandler;
  export import AnimationEventHandler = preact.AnimationEventHandler;
  export import TransitionEventHandler = preact.TransitionEventHandler;

  export function createPortal(
    vnode: preact.ComponentChildren,
    container: preact.ContainerNode,
  ): preact.VNode<any>;

  export function render(
    vnode: preact.ComponentChild,
    parent: preact.ContainerNode,
    callback?: () => void,
  ): Component | null;

  export function hydrate(
    vnode: preact.ComponentChild,
    parent: preact.ContainerNode,
    callback?: () => void,
  ): Component | null;

  export function unmountComponentAtNode(
    container: preact.ContainerNode,
  ): boolean;

  export function createFactory(
    type: preact.VNode<any>["type"],
  ): (
    props?: any,
    ...children: preact.ComponentChildren[]
  ) => preact.VNode<any>;
  export function isValidElement(element: any): boolean;
  export function isFragment(element: any): boolean;
  export function isMemo(element: any): boolean;
  export function findDOMNode(
    component: preact.Component | Element,
  ): Element | null;

  export abstract class PureComponent<
    P = {},
    S = {},
    SS = any,
  > extends preact.Component<P, S> {
    isPureReactComponent: boolean;
  }

  export type MemoExoticComponent<C extends preact.FunctionalComponent<any>> =
    preact.FunctionComponent<ComponentProps<C>> & {
      readonly type: C;
    };

  export function memo<P = {}>(
    component: preact.FunctionalComponent<P>,
    comparer?: (prev: P, next: P) => boolean,
  ): preact.FunctionComponent<P>;
  export function memo<C extends preact.FunctionalComponent<any>>(
    component: C,
    comparer?: (
      prev: preact.ComponentProps<C>,
      next: preact.ComponentProps<C>,
    ) => boolean,
  ): C;

  export interface RefAttributes<R> extends preact.Attributes {
    ref?: preact.Ref<R> | undefined;
  }

  /**
   * @deprecated Please use `ForwardRefRenderFunction` instead.
   */
  export interface ForwardFn<P = {}, T = any> {
    (props: P, ref: ForwardedRef<T>): preact.ComponentChild;
    displayName?: string;
  }

  export interface ForwardRefRenderFunction<T = any, P = {}> {
    (props: P, ref: ForwardedRef<T>): preact.ComponentChild;
    displayName?: string;
  }

  export interface ForwardRefExoticComponent<
    P,
  > extends preact.FunctionComponent<P> {
    defaultProps?: Partial<P> | undefined;
  }

  export function forwardRef<R, P = {}>(
    fn: ForwardRefRenderFunction<R, P>,
  ): preact.FunctionalComponent<PropsWithoutRef<P> & { ref?: preact.Ref<R> }>;

  export type PropsWithoutRef<P> = Omit<P, "ref">;

  interface MutableRefObject<T> {
    current: T;
  }

  export type ForwardedRef<T> =
    ((instance: T | null) => void) | MutableRefObject<T | null> | null;

  export type ElementType<
    P = any,
    Tag extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements,
  > =
    | { [K in Tag]: P extends JSX.IntrinsicElements[K] ? K : never }[Tag]
    | ComponentType<P>;

  export type ComponentPropsWithoutRef<T extends ElementType> = PropsWithoutRef<
    ComponentProps<T>
  >;

  export type ComponentPropsWithRef<C extends ElementType> = C extends new (
    props: infer P,
  ) => Component<any, any>
    ? PropsWithoutRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>;

  export type ElementRef<
    C extends
      | ForwardRefExoticComponent<any>
      | { new (props: any): Component<any, any> }
      | ((props: any) => ReactNode)
      | keyof JSXInternal.IntrinsicElements,
  > = "ref" extends keyof ComponentPropsWithRef<C>
    ? NonNullable<ComponentPropsWithRef<C>["ref"]> extends RefAttributes<
        infer Instance
      >["ref"]
      ? Instance
      : never
    : never;

  export function flushSync<R>(fn: () => R): R;
  export function flushSync<A, R>(fn: (a: A) => R, a: A): R;

  export function unstable_batchedUpdates(
    callback: (arg?: any) => void,
    arg?: any,
  ): void;

  export type PropsWithChildren<P = unknown> = P & {
    children?: preact.ComponentChildren | undefined;
  };

  export const Children: {
    map<T extends preact.ComponentChild, R>(
      children: T | T[],
      fn: (child: T, i: number) => R,
    ): R[];
    forEach<T extends preact.ComponentChild>(
      children: T | T[],
      fn: (child: T, i: number) => void,
    ): void;
    count: (children: preact.ComponentChildren) => number;
    only: (children: preact.ComponentChildren) => preact.ComponentChild;
    toArray: (children: preact.ComponentChildren) => preact.VNode<{}>[];
  };

  // scheduler
  export const unstable_ImmediatePriority: number;
  export const unstable_UserBlockingPriority: number;
  export const unstable_NormalPriority: number;
  export const unstable_LowPriority: number;
  export const unstable_IdlePriority: number;
  export function unstable_runWithPriority(
    priority: number,
    callback: () => void,
  ): void;
  export const unstable_now: () => number;
}
