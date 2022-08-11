# xml-jsx-runtime

[![npm](https://img.shields.io/npm/v/xml-jsx-runtime)](https://www.npmjs.com/package/xml-jsx-runtime) [![GitHub Repo stars](https://img.shields.io/github/stars/iMrDJAi/xml-jsx-runtime?style=social)](https://github.com/iMrDJAi/xml-jsx-runtime)

A custom [automatic](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#react-automatic-runtime) JSX runtime that transforms JSX into [xml-js](https://github.com/nashwaan/xml-js)'s non-compact objects that can be converted into plain XML strings.

***
## Installation:

Install the runtime from npm:
```bash
npm install xml-jsx-runtime -D
```

You also need to install [xml-js](https://github.com/nashwaan/xml-js) independently in order to convert your XML non-compact objects into strings:

```bash
npm install xml-jsx-runtime -S
```

## Usage:

**Method 1:** with a configuration file.

Pass the following options to [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#usage) (or whatever JSX transformer you're using):

```js
{
  "throwIfNamespace": false,
  "runtime": "automatic",
  "importSource": "xml-jsx-runtime/runtime"
}
```

Note that you might not be using [`@babel/plugin-transform-react-jsx`](https://www.npmjs.com/package/@babel/plugin-transform-react-jsx) directly, as it is included in other presets such as  [`@babel/preset-react`](https://www.npmjs.com/package/@babel/preset-react) or [`@vitejs/plugin-react`](https://www.npmjs.com/package/@vitejs/plugin-react). Or you might be using esbuild's own [JSX loader](https://esbuild.github.io/content-types/#jsx) instead. Either way, you should figure out how to configure your JSX loader by yourself.

**Method 2:** with a `@jsxImportSource` pragma comment (recommanded).

You may add the following comment to the top of your `.jsx` file:

```js
/** @jsxImportSource xml-jsx-runtime/runtime */
```

And the runtime will be explicitly enabled for that file (only).

This method allows you to keep using React JSX in your project, and only use xml-jsx-runtime where you need it.

You'll still need to set `throwIfNamespace` to `false` from your configuration file if you want XML namespace support. Also you should add `/** @jsxRuntime automatic */` as well if it's not already set by default.

## Examples & Features

Quick start:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'


const src = <book category='WEB'>
  <title lang='en'>Learning XML</title>
  <author>Erik T. Ray</author>
  <year>2003</year>
  <price>39.95</price>
</book>

console.log(src)
/** Output:
 * XMLElement {
 *   elements: [
 *     XMLElement {
 *       type: 'element',
 *       name: 'book',
 *       attributes: [Object],
 *       elements: [Array]
 *     }
 *   ]
 * }
 */

const xml = js2xml(src) // to xml string

console.log(xml)
/** Output:
 * <book category="WEB"><title lang="en">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book>
 */
```

Fragments are supported:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const xml = js2xml(
  <>
    <book id='1' />
    <book id='2' />
    <>
      <book id='3' />
      <>
        <book id='4' />
      </>
    </>
  </>
)

console.log(xml)
/** Output:
 * <book id="1"/><book id="2"/><book id="3"/><book id="4"/>
 */
```

Unlike React, the `key` attribute isn't concidered special:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const xml = js2xml(
  <>
    <elm key='1' />
    <elm key='2' {...undefined} />
    <elm {...undefined} key='3' />
  </>
)

console.log(xml)
/** Output:
 * <elm key="1"/><elm key="2"/><elm key="3"/>
 */
```

Note that internally the 3rd element will fallback to the lagecy `createElement` function instead of the `jsx` function. Thankfully, `xml-jsx-runtime` handles that case correctly. See more about this issue [here](https://github.com/facebook/react/issues/20031).

The `children` attribute is reserved by JSX to pass child elements, however you may still specify it by adding the `$:` namespace prefix:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const xml = js2xml(
  <room adults={2} $:children={1} />
  /**
   * Or
   * <room adults={2} {...{'$:children': 1}} />
   * if you environment doesn't support XML namespaces
   */
)

console.log(xml)
/** Output:
 * <room adults="2" children="1"/>
 */
```

Keep in mind that the `$` character is not valid as an xml namespace prefix. However, JSX supports it, so I have decided to use it as a way to bypass such limitations. It will always gets ignored in the result.

JSX always treat tags with capitalized names as [value-based](https://www.typescriptlang.org/docs/handbook/jsx.html#value-based-elements) elements, but you still may have capitalized elements by defining a variable then assigning a string to it:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const Element = 'Element'

const xml = js2xml(
  <Element />
)

console.log(xml)
/** Output:
 * <Element />
 */
```

Or, you may completely avoid that pattren by adding the `$:` prefix 😁:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const xml = js2xml(
  <$:Element />
)

console.log(xml)
/** Output:
 * <Element />
 */
```

Function elements (value-based elements) are supported, just like in React:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const Element = ({ attribute } : { attribute: string }) => (
  <element attribute={attribute} />
)

const xml = js2xml(
  <Element attribute='value' />
)

console.log(xml)
/** Output:
 * <element attribute="value"/>
 */
```

For children, the values `undefined`, `null`, `false`, `true` will be ignored in the result. Multidimensional arrays will get flattened automatically. Passing objects that are not instances of [`XMLElement`](https://github.com/iMrDJAi/xml-jsx-runtime/blob/master/src/XMLElement.ts), or types other than `string` or `number` will cause `xml-jsx-runtime` to throw an error. For attributes, all values will get converted into strings, even objects:

```tsx
/** @jsxImportSource xml-jsx-runtime/runtime */
import { js2xml } from 'xml-js'

const text = <text>Lorem {undefined} ipsum {null} dolor {false} sit {true} amet</text>

const xml = js2xml(
  <>
    {text}
    {[<a />, [<b />, false, 1337, [<c />]], <d attribute={{}} />]}
  </>
)

console.log(xml)
/** Output:
 * <text>Lorem  ipsum  dolor  sit  amet</text><a/><b/>1337<c/><d attribute="[object Object]"/>
 */
```

## License
[MIT](https://github.com/iMrDJAi/xml-jsx-runtime/blob/master/LICENSE) © [${Mr.DJA}](https://github.com/iMrDJAi)
