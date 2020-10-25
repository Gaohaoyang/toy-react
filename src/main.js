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
