## 环境搭建

创建 toy-react 文件夹，并 `npm init` 初始化生成 `package.json` 文件。

jsx 翻译直接使用 webpack 和 babel 来解决，接下来开始配置 webpack 环境。

执行命令

``` bash
npm i webpack webpack-cli -D
```

首先创建一个 `webpack.config.js`

```js
module.exports = {
  entry: {
    main: './src/main.js',
  },
  mode: 'development',
}
```

执行 `npx webpack` 可以看到生成了 `dist` 目录。

接下来配置 babel，通过 loader 在 webpack 中配置，先进行安装：

```bash
npm install -D babel-loader @babel/core @babel/preset-env
```

可以看到 package.json 已经安装好了依赖

```js
"devDependencies": {
  "@babel/core": "^7.12.3",
  "@babel/preset-env": "^7.12.1",
  "babel-loader": "^8.1.0",
  "webpack": "^5.1.3",
  "webpack-cli": "^4.0.0"
}
```

配置 loader

``` js
module.exports = {
  entry: {
    main: './src/main.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
}
```

在 main.js 中写点代码测试一下

```js
for (const i of [1, 2, 3]) {
  console.log(i)
}
```

执行 `npx webpack` 后，看到 dist/main.js

```js
...
eval("for (var _i = 0, _arr = [1, 2, 3]; _i < _arr.length; _i++) {\n  var i = _arr[_i];\n  console.log(i);\n}\n\n//# sourceURL=webpack://toy-react/./src/main.js?");
...
```

为了更方便的查看，增加一个 `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script src="./dist/main.js"></script>
</body>
</html>
```

浏览器直接打开

![](https://gw.alicdn.com/tfs/TB166_djZieb18jSZFvXXaI3FXa-670-234.png)

点击进去可以看到一个虚拟的 `main.js` 文件，这正是 babel 和 webpack 编译构建出来的

![](https://gw.alicdn.com/tfs/TB1cZJPk9slXu8jSZFuXXXg7FXa-1424-536.png)

目前已经完成了 babel 的配置，但是还不能写 jsx，接下来配置一个 babel 插件，让我们来使用 jsx 编写代码

在 `main.js` 加入如下代码

```diff
  for (const i of [1, 2, 3]) {
    console.log(i)
  }

+ let a = <div />
```

执行 `npx webpack` 报错

```bash
toy-react git:(main) ✗ npx webpack
asset main.js 3.22 KiB [emitted] (name: main)
./src/main.js 39 bytes [built] [code generated] [1 error]

ERROR in ./src/main.js
Module build failed (from ./node_modules/_babel-loader@8.1.0@babel-loader/lib/index.js):
SyntaxError: /Users/haoyanggao/Documents/github/toy-react/src/main.js: Support for the experimental syntax 'jsx' isn't currently enabled (5:9):

  3 | }
  4 |
> 5 | let a = <div />
    |         ^
  6 |

Add @babel/preset-react (https://git.io/JfeDR) to the 'presets' section of your Babel config to enable transformation.
If you want to leave it as-is, add @babel/plugin-syntax-jsx (https://git.io/vb4yA) to the 'plugins' section to enable parsing.
    at Parser._raise (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:799:17)
    at Parser.raiseWithData (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:792:17)
    at Parser.expectOnePlugin (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9104:18)
    at Parser.parseExprAtom (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:10410:22)
    at Parser.parseExprSubscripts (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9976:23)
    at Parser.parseUpdate (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9956:21)
    at Parser.parseMaybeUnary (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9945:17)
    at Parser.parseExprOps (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9815:23)
    at Parser.parseMaybeConditional (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9789:23)
    at Parser.parseMaybeAssign (/Users/haoyanggao/Documents/github/toy-react/node_modules/_@babel_parser@7.12.3@@babel/parser/lib/index.js:9752:21)

webpack 5.1.3 compiled with 1 error in 664 ms
```

这是因为 babel 预制的配置 preset 是不包含 jsx 的能力，现在安装 plugin

```bash
npm i @babel/plugin-transform-react-jsx -D
```

```diff
module.exports = {
  entry: {
    main: './src/main.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
+           plugins: ['@babel/plugin-transform-react-jsx'],
          },
        },
      },
    ],
  },
}
```

![](https://gw.alicdn.com/tfs/TB16tleZFY7gK0jSZKzXXaikpXa-1442-580.png)

翻译出了 `React.createElement` 但是我们要使用 ToyReact 这个名字，所以要继续改一下配置

```diff
module.exports = {
  entry: {
    main: './src/main.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
+             [
+               '@babel/plugin-transform-react-jsx',
+               {
+                 pragma: 'createElement',
+               },
+             ],
            ],
          },
        },
      },
    ],
  },
}

```

![](https://gw.alicdn.com/tfs/TB1tZBnZUY1gK0jSZFCXXcwqXXa-950-278.png)

pragma 里写的值会直接展示在编译后结果，至此环境搭建完成

## 参考链接

- 需提前安装 Node.js、npm 环境： https://nodejs.org/en/
- webpack： https://webpack.js.org/guides/getting-started/
- React Tutorial 教程： https://reactjs.org/tutorial/tutorial.html
- TicTacToe： https://codepen.io/gaearon/pen/gWWZgR
- MDN： https://developer.mozilla.org/en-US/

今日作业

今天的课大家感觉如何？收获大吗？

咱们今天的作业也很简单，就是消化课上的知识，并完成基于实 DOM 体系的 toy-react 的 component 的设定。你自己可以课后继续熟悉下 JSX，然后跟上课程的进度，自己基于 JSX 实现组件的语法。
