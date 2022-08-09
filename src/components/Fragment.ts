import { populateChildren, type ChildType } from '../index'
import XMLElement from '../XMLElement'


const Fragment = ({ children } : { children: ChildType|ChildType[] }) => {
  return new XMLElement({
    elements: populateChildren(children)
  })
}

export default Fragment
