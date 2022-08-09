/* eslint-disable @typescript-eslint/no-namespace */
import { transformJSX } from './index'
import Fragment from './components/Fragment'
import type { FunctionElement, ChildType } from './index'
import type XMLElement from './XMLElement'


const jsx = (
  type: string|FunctionElement,
  props: Record<string, any> & { children?: ChildType },
  key?: any
) => transformJSX(type, props, key)

const jsxs = (
  type: string|FunctionElement,
  props: Record<string, any> & { children?: ChildType[] },
  key?: any
) => transformJSX(type, props, key)

declare namespace JSX {
  type Element = XMLElement
  type ElementClass = string
  interface ElementChildrenAttribute { children?: ChildType|ChildType[] }
  interface IntrinsicElements {
    [name: string]: Record<string, any> & ElementChildrenAttribute
  }
}

export {
  jsx,
  jsxs,
  type JSX,
  Fragment
}
