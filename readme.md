# tsx-vanilla

Create DOM elements using JSX with excellent TypeScript support

## Installation

  npm install tsx-vanilla

## Setup

To use JSX, you need a compiler to transform the JSX into something the browser would understand. Easiest way to get this done is to use TypeScript with Vite and add this to your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "element",
    "jsxFragmentFactory": "fragment"
  }
}
```

And then you include this import statement in every file where you want to use JSX.

```js
import { element, fragment } from "tsx-vanilla"
```

Alternatively you can add this to your `tsconfig.json`,

```json
{
  "compilerOptions": {
    "jsx": "react"
  }
}
```

and import this.

```js
import * as React from "tsx-vanilla"
```

You can also use something like Babel.

## Usage

```jsx
import { element, fragment } from "tsx-vanilla"

// Functional components work as you'd expect
const Counter = (props: { start?: number }) => {
  let count = props.start || 0
  return <>
    <h2>Counter</h2>
    <button
      className="btn"
      onclick={function() {
        this.textContent = `count: ${++count}`
    }}>
      count: {count}
    </button>
  </>
}

// JSX expressions return DOM elements that can be appended directly to the DOM
document.body.append(
  <h1>tsx-vanilla</h1>,
  <Counter />,
  <Counter start={2} />
)
```

Attributes are set directly on the DOM element using something like this: `element[key] = props[key]`.
This is the case for most attributes, but not:

- `style`
- `attributes`
- `children`
- `ref`
- `dataset`
- `shadowRootOptions`

### style

`style` accepts either a string or an object. If it's a string, the style attribute is set to the value. If it's an object, all properties on that object are assigned to the `CSSStyleDeclaration` of the element. Custom properties are also accepted.

```jsx
<h1 style="color: blue;">Blue text</h1>
<p style={{
  backgroundColor: "#eee",
  borderRadius: "0.5em",
  "--custom-property": "1em"
  padding: "var(--custom-property)",
}}>This is a styled paragraph.</p>
```

### attributes

Not all attributes can be set as a property directly on the element. Therefore you can pass an object to `attributes` and all properties on that object will be set on the element using `Element.setAttribute()`. This can be used to set Aria-attributes or with SVG elements where most attributes have to be set with `setAttribute()`

### dataset

`dataset` accepts an object which simply gets copied over to the element's dataset using `Object.assign()`.

### children

Assigning children using the `children` attribute is supported as long as the JSX-element doesn't also have nested elements. Children can be strings, numbers, Nodes, or an array of the previously mentioned types. `true`, `false`, `null` and `undefined` are allowed to be passed as children, but will be filtered out. 

When creating components accepting children, multiple children will be passed as an array, while single children won't. Something to also keep in mind when creating components is that the children array passed to your component won't be flattend. 

### ref

`ref` allows reference to an element without pulling it out of a nested node tree.

```jsx
import { element, ref } from "tsx-vanilla"

// Can either be a ref object
const divRef = ref<HTMLDivElement>()

<div ref={divRef} />

console.log(divRef.value)

// Or a callback invoked after all attributes are set, but before being added to the DOM
<div ref={el => console.log(el)} />
```

### shadowRootOptions

`shadowRootOptions` accepts an object which will get passed to `Element.attachShadow()` for the element.
If this attribute is present, all children will be appended to the `ShadowRoot` instead of the element.

### Other attributes

All properties that can be set on an element are supported. This includes `textContent`, `innerHTML` and `innerText`, but be careful. Attributes are set after children are appended. Therefore all children will be overridden. `innerHTML` can also make your site vulnerable to cross site scripting if the text is user-submitted.

## SVG support

All non-deprecated SVG elements except for those with the same name as an HTML element are supported. Since most attributes have to be set with `setAttribute()`, you need to use `attributes` a lot with SVG elements.

```jsx
<svg attributes={{ viewBox: '0 0 5 4', width: 200, height: 160 }}>
  <circle attributes={{
    r: 1, cx: 2, cy: 2, fill: "blue", stroke: "black", "stroke-width": 0.1
  }} />
</svg>
```

If you need to use non-supported SVG elements, you can include a function like this one to create a component.

```jsx
import { element, appendChildren } from "tsx-vanilla"

function createSVGComponent(tagName: string) {
  return ({ children, ...attributes }: { children: JSX.Child | JSX.Children, [key: string]: any }) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tagName)
    if (children) appendChildren([children], el)
    for (const attr in attributes) el.setAttribute(attr, attributes[attr])
    return el
  }
}

const SVGAnchor = createSVGComponent('a')

document.body.append(
  <svg attributes={{ viewBox: '0 0 5 4', width: 200, height: 160 }}>
    <SVGAnchor href="#">
      <circle attributes={{ r: 1, cx: 2, cy: 2, fill: "black" }} />
    </SVGAnchor>
  </svg>
)
```

## Can you use this without JSX?

Using this without JSX is fully supported, and in fact the returned elements will be typed better due to limitations of the JSX.Element type. The first JSX example could be rewritten like this without JSX:

```typescript
import { element, fragment } from "tsx-vanilla"

const Counter = (props: { start?: number }) => {
  let count = props.start || 0
  return fragment({
    children: [
      element('h2', null, 'Counter'),
      element('button', { 
        className: 'btn',
        onclick() {
          this.textContent = `count: ${++count}`
        }
      }, 'count: ', count)
    ]
  })
}

document.body.append(
  element('h1', null, 'tsx-vanilla'),
  Counter({}),
  Counter({ start: 2 })
)
```

It's not even that clumbsy without JSX.

## What is this meant for?

If you need a lightweight, fast and easy alternative to `document.createElement()` or `innerHTML` for creating elements on a website where a full framework isn't necessary, this might be the right fit. While this has very little overhead compared to using `document.createElement()` directly, it won't be as fast as cloning templates using `Node.cloneNode(true)` if you are reusing a lot of components.

Since this package is very small, there's no reactivity or state management. If you need to modify elements, you either have to recreate them every rerender or save a reference to them and do manual DOM manipulation if you want good performance.

## Contributing

The purpose of this package is to be lightweight and I doubt any new features will be added unless they are very easy to implement. What would be appreciated is improving the types. It's likely that some attributes are missing or incorrectly typed and the types will need to be maintained as the web standards evolve in the future.