class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(component) {
    this.root.appendChild(component.root)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
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

  get root() {
    if (!this._root) {
      this._root = this.render().root
    }
    return this._root
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
        if(typeof item === 'object' && item instanceof Array) {
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
  parentElement.appendChild(component.root)
}
