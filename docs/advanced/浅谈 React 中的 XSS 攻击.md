# 浅谈 React 中的 XSS 攻击

> [https://www.zoo.team/article/xss-in-react](https://www.zoo.team/article/xss-in-react)
>

## 前言

前端一般会面临 XSS 这样的安全风险，但随着 React 等现代前端框架的流行，使我们在平时开发时不用太关注安全问题。以 React 为例，React 从设计层面上就具备了很好的防御 XSS 的能力。本文将以源码角度，看看 React 做了哪些事情来实现这种安全性的。

## XSS 攻击是什么

Cross-Site Scripting（跨站脚本攻击）简称 XSS，是一种代码注入攻击。XSS 攻击通常指的是利用网页的漏洞，攻击者通过巧妙的方法注入 XSS 代码到网页，因为浏览器无法分辨哪些脚本是可信的，导致 XSS 脚本被执行。XSS 脚本通常能够窃取用户数据并发送到攻击者的网站，或者冒充用户，调用目标网站接口并执行攻击者指定的操作。

## XSS 攻击类型

### 反射型 XSS

- XSS 脚本来自当前 HTTP 请求

- 当服务器在 HTTP 请求中接收数据并将该数据拼接在 HTML 中返回时，例子：

  ```javascript
   // 某网站具有搜索功能，该功能通过 URL 参数接收用户提供的搜索词：
   https://xxx.com/search?query=123
   // 服务器在对此 URL 的响应中回显提供的搜索词：
   <p>您搜索的是: 123</p>
   // 如果服务器不对数据进行转义等处理，则攻击者可以构造如下链接进行攻击：
   https://xxx.com/search?query=<img src="empty.png" onerror ="alert('xss')">
   // 该 URL 将导致以下响应，并运行 alert('xss')：
   <p>您搜索的是: <img src="empty.png" onerror ="alert('xss')"></p>
   // 如果有用户请求攻击者的 URL ，则攻击者提供的脚本将在用户的浏览器中执行。
  ```

  ### 存储型 XSS

- XSS 脚本来自服务器数据库中

- 攻击者将恶意代码提交到目标网站的数据库中，普通用户访问网站时服务器将恶意代码返回，浏览器默认执行，例子：

  ```xml
   // 某个评论页，能查看用户评论。
   // 攻击者将恶意代码当做评论提交，服务器没对数据进行转义等处理
   // 评论输入：
   <textarea>
      <img src="empty.png" onerror ="alert('xss')">
   </textarea>
   // 则攻击者提供的脚本将在所有访问该评论页的用户浏览器执行
  ```

  ### DOM 型 XSS

该漏洞存在于客户端代码，与服务器无关

- 类似反射型，区别在于 DOM 型 XSS 并不会和后台进行交互，前端直接将 URL 中的数据不做处理并动态插入到 HTML 中，是纯粹的前端安全问题，要做防御也只能在客户端上进行防御。

  ## React 如何防止 XSS 攻击

无论使用哪种攻击方式，其本质就是将恶意代码注入到应用中，浏览器去默认执行。React 官方中提到了 React DOM 在渲染所有输入内容之前，默认会进行转义。它可以确保在你的应用中，永远不会注入那些并非自己明确编写的内容。所有的内容在渲染之前都被转换成了字符串，因此恶意代码无法成功注入，从而有效地防止了 XSS 攻击。我们具体看下：

### 自动转义

React 在渲染 HTML 内容和渲染 DOM 属性时都会将 `"'&<>` 这几个字符进行转义，转义部分源码如下：

```javascript
for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#x27;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }
  }
```

这段代码是 React 在渲染到浏览器前进行的转义，可以看到对浏览器有特殊含义的字符都被转义了，恶意代码在渲染到 HTML 前都被转成了字符串，如下：

```javascript
// 一段恶意代码
<img src="empty.png" onerror ="alert('xss')"> 
// 转义后输出到 html 中
&lt;img src=&quot;empty.png&quot; onerror =&quot;alert(&#x27;xss&#x27;)&quot;&gt; 
```

这样就有效的防止了 XSS 攻击。

### JSX 语法

JSX 实际上是一种语法糖，Babel 会把 JSX 编译成 `React.createElement()` 的函数调用，最终返回一个 `ReactElement`，以下为这几个步骤对应的代码：

```js
// JSX
const element = (
  <h1 className="greeting">
      Hello, world!
  </h1>
);
// 通过 babel 编译后的代码
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
// React.createElement() 方法返回的 ReactElement
const element = {
  $$typeof: Symbol('react.element'),
  type: 'h1',
  key: null,
  props: {
    children: 'Hello, world!',
        className: 'greeting'   
  }
  ...
}
```

我们可以看到，最终渲染的内容是在 Children 属性中，那了解了 JSX 的原理后，我们来试试能否通过构造特殊的 Children 进行 XSS 注入，来看下面一段代码：

```javascript
const storedData = `{
    "ref":null,
    "type":"body",
    "props":{
        "dangerouslySetInnerHTML":{
            "__html":"<img src=\"empty.png\" onerror =\"alert('xss')\"/>"
        }
    }
}`;
// 转成 JSON
const parsedData = JSON.parse(storedData);
// 将数据渲染到页面
render () {
    return <span> {parsedData} </span>; 
}
```

这段代码中， 运行后会报以下错误，提示不是有效的 ReactChild。

```javascript
Uncaught (in promise) Error: Objects are not valid as a React child (found: object with keys {ref, type, props}). If you meant to render a collection of children, use an array instead.
```

那究竟是哪里出问题了？我们看一下 ReactElement 的源码：

```javascript
const symbolFor = Symbol.for;
REACT_ELEMENT_TYPE = symbolFor('react.element');
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 这个 tag 唯一标识了此为 ReactElement
    $$typeof: REACT_ELEMENT_TYPE,
    // 元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,
    // 记录创建此元素的组件
    _owner: owner,
  };
  ...
  return element;
}
```

注意到其中有个属性是 `$$typeof`，它是用来标记此对象是一个 `ReactElement`，React 在进行渲染前会通过此属性进行校验，校验不通过将会抛出上面的错误。React 利用这个属性来防止通过构造特殊的 Children 来进行的 XSS 攻击，原因是 `$$typeof` 是个 Symbol 类型，进行 JSON 转换后会 Symbol 值会丢失，无法在前后端进行传输。如果用户提交了特殊的 Children，也无法进行渲染，利用此特性，可以防止存储型的 XSS 攻击。

## 在 React 中可引起漏洞的一些写法

### 使用 dangerouslySetInnerHTML

`dangerouslySetInnerHTML` 是 React 为浏览器 DOM 提供 `innerHTML` 的替换方案。通常来讲，使用代码直接设置 HTML 存在风险，因为很容易使用户暴露在 XSS 攻击下，因为当使用 `dangerouslySetInnerHTML` 时，React 将不会对输入进行任何处理并直接渲染到 HTML 中，如果攻击者在 dangerouslySetInnerHTML 传入了恶意代码，那么浏览器将会运行恶意代码。看下源码：

```javascript
function getNonChildrenInnerMarkup(props) {
  const innerHTML = props.dangerouslySetInnerHTML; // 有dangerouslySetInnerHTML属性，会不经转义就渲染__html的内容
  if (innerHTML != null) {
    if (innerHTML.__html != null) {
      return innerHTML.__html;
    }
  } else {
    const content = props.children;
    if (typeof content === 'string' || typeof content === 'number') {
      return escapeTextForBrowser(content);
    }
  }
  return null;
}
```

所以平时开发时最好避免使用 `dangerouslySetInnerHTML`，如果不得不使用的话，前端或服务端必须对输入进行相关验证，例如对特殊输入进行过滤、转义等处理。前端这边处理的话，推荐使用[白名单过滤](https://jsxss.com/zh/index.html)，通过白名单控制允许的 HTML 标签及各标签的属性。

### 通过用户提供的对象来创建 React 组件

举个例子：

```javascript
// 用户的输入
const userProvidePropsString = `{"dangerouslySetInnerHTML":{"__html":"<img onerror='alert(\"xss\");' src='empty.png' />"}}"`;
// 经过 JSON 转换
const userProvideProps = JSON.parse(userProvidePropsString);
// userProvideProps = {
//   dangerouslySetInnerHTML: {
//     "__html": `<img onerror='alert("xss");' src='empty.png' />`
//      }
// };
render() {
     // 出于某种原因解析用户提供的 JSON 并将对象作为 props 传递
    return <div {...userProvideProps} /> 
}
```

这段代码将用户提供的数据进行 JSON 转换后直接当做 `div` 的属性，当用户构造了类似例子中的特殊字符串时，页面就会被注入恶意代码，所以要注意平时在开发中不要直接使用用户的输入作为属性。

### 使用用户输入的值来渲染 a 标签的 href 属性，或类似 img 标签的 src 属性等

```javascript
const userWebsite = "javascript:alert('xss');";
<a href={userWebsite}></a>
```

如果没有对该 URL 进行过滤以防止通过 `javascript:` 或 `data:` 来执行 JavaScript，则攻击者可以构造 XSS 攻击，此处会有潜在的安全问题。 用户提供的 URL 需要在前端或者服务端在入库之前进行验证并过滤。

## 服务端如何防止 XSS 攻击

服务端作为最后一道防线，也需要做一些措施以防止 XSS 攻击，一般涉及以下几方面：

- 在接收到用户输入时，需要对输入进行尽可能严格的过滤，过滤或移除特殊的 HTML 标签、JS 事件的关键字等。

- 在输出时对数据进行转义，根据输出语境 (html/javascript/css/url)，进行对应的转义

- 对关键 Cookie 设置 http-only 属性，JS 脚本就不能访问到 http-only 的 Cookie 了

- 利用

   

  CSP

   

  来抵御或者削弱 XSS 攻击，一个 CSP 兼容的浏览器将会仅执行从白名单域获取到的脚本文件，忽略所有的其他脚本 (包括内联脚本和 HTML 的事件处理属性)

  ## 总结

出现 XSS 漏洞本质上是输入输出验证不充分，React 在设计上已经很安全了，但是一些反模式的写法还是会引起安全漏洞。Vue 也是类似，Vue 做的安全措施主要也是转义，HTML 的内容和动态绑定的属性都会进行转义。无论使用 React 或 Vue 等前端框架，都不能百分百的防止 XSS 攻击，所以服务端必须对前端参数做一些验证，包括但不限于特殊字符转义、标签、属性白名单过滤等。一旦出现安全问题一般都是挺严重的，不管是敏感数据被窃取或者用户资金被盗，损失往往无法挽回。我们平时开发中需要保持安全意识，保持代码的可靠性和安全性。
