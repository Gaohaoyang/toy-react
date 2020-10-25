上一节课中学习了自定义组件，但是组件还缺失 state 和生命周期等能力。这一节课将逐渐补全这些能力。

```js
import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        {this.children}
      </div>
    )
  }
}

render(
  <MyComponent id="a" class="c">
    <div>Joe</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)
```

上一节课中的 MyComponent 类实现了 render 但是没有实现数据的来源，和状态的改变。

## 声明 State

main.js

```js
import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  constructor() {
    super()
    this.state = {
      a: 1,
      b: 2,
    }
  }
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        <span>{this.state.a.toString()}</span>
        {this.children}
      </div>
    )
  }
}

render(
  <MyComponent id="a" class="c">
    <div>Joe</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)
```

![](https://gw.alicdn.com/tfs/TB1pW3LoLzO3e4jSZFxXXaP_FXa-1650-538.png)

看到 state 已经渲染成功，接下来看看如何更新

## 基于 range 的 Dom 绘制

toy-react.js

```js
const RENDER_TO_DOM = Symbol('render to dom')

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    // range.deleteContents()
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this.render()[RENDER_TO_DOM](range)
  }
}

export const createElement = (type, attributes, ...children) => {
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    e = new type()
  }
  if (attributes) {
    Object.entries(attributes).forEach((item) => {
      e.setAttribute(item[0], item[1])
    })
  }
  let insertChildren = (children) => {
    if (children && children.length > 0) {
      children.forEach((item) => {
        if (typeof item === 'string') {
          item = new TextWrapper(item)
        }
        if (typeof item === 'object' && item instanceof Array) {
          insertChildren(item)
        } else {
          e.appendChild(item)
        }
      })
    }
  }
  insertChildren(children)
  return e
}

export const render = (component, parentElement) => {
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}
```

![](https://gw.alicdn.com/tfs/TB16Nia0oT1gK0jSZFrXXcNCXXa-1512-500.png)

## 触发 rerender

接下来给组件增加重新渲染的能力

main.js

```js
import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  constructor() {
    super()
    this.state = {
      a: 1,
      b: 2,
    }
  }
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        <span>{this.state.a.toString()}</span>
        <button
          onClick={() => {
            this.state.a++
            this.rerender()
          }}
        >add</button>
        {this.children}
      </div>
    )
  }
}

render(
  <MyComponent id="a" class="c">
    <div>Joe</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)
```

toy-react.js

```js
const RENDER_TO_DOM = Symbol('render to dom')

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(
        RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
        value
      )
    } else {
      this.root.setAttribute(name, value)
    }
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }

  rerender() {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }
}

export const createElement = (type, attributes, ...children) => {
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    e = new type()
  }
  if (attributes) {
    Object.entries(attributes).forEach((item) => {
      e.setAttribute(item[0], item[1])
    })
  }
  let insertChildren = (children) => {
    if (children && children.length > 0) {
      children.forEach((item) => {
        if (typeof item === 'string') {
          item = new TextWrapper(item)
        }
        if (typeof item === 'object' && item instanceof Array) {
          insertChildren(item)
        } else {
          e.appendChild(item)
        }
      })
    }
  }
  insertChildren(children)
  return e
}

export const render = (component, parentElement) => {
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}
```

![](https://gw.alicdn.com/tfs/TB19v040XT7gK0jSZFpXXaTkpXa-432-235.gif)


## 实现 setState

main.js

```js
import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  constructor() {
    super()
    this.state = {
      a: 1,
      b: 2,
    }
  }
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        <div>{this.state.a.toString()}</div>
        <div>{this.state.b.toString()}</div>
        <button
          onClick={() => {
            this.setState({
              a: this.state.a + 1,
            })
          }}
        >
          add
        </button>
        {this.children}
      </div>
    )
  }
}

render(
  <MyComponent id="a" class="c">
    <div>Joe</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)
```

toy-react.js

```js
const RENDER_TO_DOM = Symbol('render to dom')

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(
        RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
        value
      )
    } else {
      this.root.setAttribute(name, value)
    }
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }

  rerender() {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.rerender()
      return
    }
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p]
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.state, newState)
    this.rerender()
  }
}

export const createElement = (type, attributes, ...children) => {
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    e = new type()
  }
  if (attributes) {
    Object.entries(attributes).forEach((item) => {
      e.setAttribute(item[0], item[1])
    })
  }
  let insertChildren = (children) => {
    if (children && children.length > 0) {
      children.forEach((item) => {
        if (typeof item === 'string') {
          item = new TextWrapper(item)
        }
        if (typeof item === 'object' && item instanceof Array) {
          insertChildren(item)
        } else {
          e.appendChild(item)
        }
      })
    }
  }
  insertChildren(children)
  return e
}

export const render = (component, parentElement) => {
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}
```

![](https://gw.alicdn.com/tfs/TB1.xN_0kY2gK0jSZFgXXc5OFXa-432-235.gif)
