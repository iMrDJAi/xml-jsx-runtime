import XMLElement from './XMLElement'


type ChildType = XMLElement|XMLElement[]|ChildType[]|string|number|undefined|null|boolean
type FunctionElement = (...props: any) => ChildType|ChildType[]

const populateChildren = (
  children: ChildType|ChildType[]
): XMLElement[] => {
  if (!Array.isArray(children)) return populateChildren([children])
  const elements: XMLElement[] = []

  for (const child of children) {
    // Ignore these values
    if ([undefined, null, false, true].includes(child as any)) continue
    if (Array.isArray(child)) {
      elements.push(...populateChildren(child))
      continue
    }
    if (child instanceof XMLElement) {
      // It could be a wrapper element
      if (child.elements && !child.type) elements.push(...populateChildren(child.elements))
      else elements.push(child)
      continue
    }
    if (['string', 'number'].includes(typeof child)) {
      // Text nodes
      elements.push(new XMLElement({
        type: 'text',
        text: `${child}`
      }))
      continue
    }
    if (typeof child === 'object') throw new Error('Objects are not valid as XML children!')
    throw new Error(`The type "${typeof child}" is not valid for XML children!`)
  }

  return elements
}

const populateAttributes = (
  props: Record<string, any> & { children?: ChildType|ChildType[] },
  key?: any
) => {
  const attributes: Record<string, string> = {}

  for (let prop in props) {
    const value = props[prop]
    if (value === undefined || prop === 'children') continue
    // Remove the "$:" prefix
    prop = prop.replace(/^\$:/, '')
    attributes[prop] = `${value}`
  }
  // "props.key" has priority over "key"
  if (attributes.key === undefined && key !== undefined) {
    attributes.key = key
  }

  return attributes
}

const transformJSX = (
  type: string|FunctionElement,
  props: Record<string, any> & { children?: ChildType|ChildType[] },
  key?: any
) => {
  // Maybe it's a function element?
  try {
    const children = (type as FunctionElement)({ key, ...props })
    return children instanceof XMLElement ? children : populateChildren(children)
  } catch (err) {
    if (typeof type !== 'string') throw err
  }

  // Todo: validate tag name

  const attributes = populateAttributes(props, key)
  const elements = populateChildren(props.children)

  return new XMLElement({
    elements: [
      new XMLElement({
        type: 'element',
        name: type.replace(/^\$:/, ''),
        attributes,
        elements
      })
    ]
  })
}

const createElement = (
  type: string|FunctionElement,
  props: Record<string, any> | null,
  ...children: ChildType[]
) => transformJSX(type, { ...props, children })

export { populateChildren, populateAttributes, transformJSX, createElement }
export type { ChildType, FunctionElement }
