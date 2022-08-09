/* eslint-disable @typescript-eslint/no-empty-interface */
interface DeclarationAttributes {
  version?: string
  encoding?: 'utf-8'|string
  standalone?: 'yes'|'no'
}

interface Attributes {
  [key: string]: string|undefined
}

interface XMLElementProps {
  declaration?: {
    attributes?: DeclarationAttributes
  }
  instruction?: string
  attributes?: Attributes
  cdata?: string
  doctype?: string
  comment?: string
  text?: string
  type?: 'element'|'text'|string
  name?: string
  elements?: Array<XMLElement>
}

interface XMLElement extends XMLElementProps {}

class XMLElement {
  constructor (props: XMLElementProps) {
    Object.assign(this, props)
  }
}

export default XMLElement
export type { DeclarationAttributes, Attributes, XMLElementProps }
