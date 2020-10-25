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
