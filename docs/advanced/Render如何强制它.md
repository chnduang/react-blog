## 什么是 React 中的 Render 以及如何强制它？

> [https://mp.weixin.qq.com/s/y3ByC1WSmhSabPo8yEQ6Dg](https://mp.weixin.qq.com/s/y3ByC1WSmhSabPo8yEQ6Dg)

React 中的 Render 究竟是什么，我们如何强制一个类或功能组件重新渲染，并且可以在不调用 setState 的情况下完成？

是否可以强制 React 组件渲染（并且不调用 setState）？这个问题的简短回答是可以。但是，在我们了解如何操作之前，让我们先弄清楚一些重要的事情。

从 React 的早期开始，开发人员就担心不必要的组件重新渲染并试图优化它们。我已经可以告诉你，过早优化并不是最好的主意，因为 React 非常快，而且问题通常出在代码的编写方式上。因此，当确实存在明显的问题时，请注意它。

组件重新渲染的事实并不意味着实际上修改了 DOM。如果这对你来说是一个惊喜，那就忍受我吧。

让我们先解释一下当我们在 React 中更新状态时到底发生了什么。

## **React 中的渲染是什么？**

React 通过使用React.createElement函数来接管对 DOM 的操作，因此我们不必手动操作。相反，更新仅在需要时进行。

我们只用 JSX 或纯createElement函数来描述我们希望 DOM 的外观，而 React 创建了 DOM 的虚拟表示。

然后，在此基础上，每当状态改变后出现差异时，就会更新真实的 DOM。更重要的是，如果计划了很多 DOM 更新，React 可以将它们批处理以提高效率。尽管如此，整个过程包括三个阶段：渲染、协调和提交。

渲染-呼叫作出反应渲染功能，从收集输出createElement功能和解-新元素对前面给出的元素进行比较，如果有差异的虚拟DOM更新，提交-真正的DOM更新。

就像我之前提到的，改变状态并不意味着commit阶段会被执行，因为如果虚拟 DOM 没有改变就不需要它。

正如你在下面的示例中看到的，无论我们单击按钮多少次，name属性都设置为相同的值，尽管我们调用了该setState方法。

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
// A simple exampleclass App extends Components {    state = {  name: ‘Thomas’}
  onClickHandler = () => {    this.setState({name: ‘Thomas’})}
  render() {    <div>      <p>My name is {this.state.name}</p><br/>      <button onClick={this.onClickHandler}>Click me</button>    </div>  }}
```

如果将控制台日志放入渲染函数中，你将看到它将被调用。但是，如果你在检查器中检查 DOM，你将不会看到指示 DOM 更改的闪烁。现在，让我们谈谈如何触发重新渲染。

## **在 React 中强制重新渲染组件**

如果你使用的是 React 类组件，那么它就像使用this.forceUpdate()函数一样简单。

- 
- 
- 
- 
- 
- 
- 
- 
- 

```
class App extends Components {    onClickHandler = () => {    this.forceUpdate()}
  render() {    <button onClick={this.onClickHandler}>Click me</button>  }}
```

只需确保this上下文引用组件实例。

在下面的示例中，this指的是React 组件实例的范围innerFunction的是 而不是范围，因此它不起作用。

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
// This won’t workclass App extends Components {    onClickHandler = () => {    function innerFunction() {      this.forceUpdate()    }    innerFunction()}
  render() {    <button onClick={this.onClickHandler}>Click me</button>  }}
```

现在，你知道它是多么容易，但请注意，在 99.99% 的情况下你不应该需要它。如果你这样做，那么你可能做错了什么，并且可能有一个更好的解决方案来解决你想要实现的目标。

如果你正在更新状态值，但它们没有正确呈现，那么你可能会直接改变当前状态而不是提供新值。你也有可能传递相同的引用。

请记住，在更新状态时，应该始终提供一个新值。例如，字符串是不可变的；但是，对象和数组作为引用传递，因此：

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
// Equality check is done by checking if values are the sameconst str1 = ‘hello’const str2 = ‘hello’
str1 == str2  // true
// Equality check is performed by checking if values have the same referenceconst obj1 = {str: ‘hello’}const obj2 = {str: ‘hello’}const obj3 = obj1ob1 == obj2  // falseobj3 == obj1  // true
```

## **在功能组件中强制重新渲染**

在函数组件中没有forceUpdate方法。但是，我们可以使用以下代码模拟此功能。

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, {useState} from ‘react’
const App = props => {const [count, setCount] = useState(0)const onClickHandler = e = => {  setCount(prevCount => prevCount + 1)}
return (  <button onClick={onClickHandler}>Click me</button>)}
```

如你所见，每当我们需要重新渲染组件时，我们只需增加计数器。老实说，我们可以走得更远，为它创建一个自定义钩子。

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, {useState} from ‘react’
const useForceUpdate = () => {  const [count, setCount] = useState(0)
  const increment = () => setCount(prevCount => prevCount + 1)  return [increment, count]}
const App = props => {const [forceUpdate] = useForceUpdate()
const onClickHandler = e => {  forceUpdate()}
return (  <button onClick={onClickHandler}>Click me</button>)}
```

现在你已经了解了如何强制重新渲染组件。如果出于一些原因你想从父组件重新渲染子组件，那么，可以通过更改其 prop 来实现，如下所示：

```
const ChildComponent = props => {  return (    // child markup)}
const App = props => {  const [forceUpdate, forceUpdateValue] = useForceUpdate()
const onClickHandler = e => {  forceUpdate()}
return (  <div>    <ChildComponent key={forceUpdateValue} />    <button onClick={onClickHandler}>Click me</button>  </div>)}
```

在本文中，我们介绍了 React 中什么是渲染，状态更新时会发生什么，以及如何在类和功能组件中强制重新渲染。

最后一点，请记住，如果你认为需要强制重新渲染，请再想一想，可能有更好的方法。