## 写给 React 开发者看的 Svelte入门

> [https://mp.weixin.qq.com/s/iBYUCQS3gt162mPycZys6A](https://mp.weixin.qq.com/s/iBYUCQS3gt162mPycZys6A)

这篇文章是从具有丰富 `React` 经验的人的角度对 `Svelte` 的简洁介绍。我提供一个快速介绍，然后将重点转移到状态管理和 `DOM` 互操作性等方面。归根结底，主要希望激发大家对 `Svelte` 的兴趣。

对于 `Svelte` 的简单介绍，没有任何博客文章可以击败官方教程或文档。

# “Hello, World!” Svelte 风格

让我们从快速浏览 Svelte 组件的外观开始。

```js
<script>
  let number = 0;
</script>

<style>
  h1 {
    color: blue;
  }
</style>

<h1>Value: {number}</h1>

<button on:click={() => number++}>Increment</button>
<button on:click={() => number--}>Decrement</button> 
```

该内容放在一个`.svelte`文件中，并由`Rollup`或`webpack`插件处理以生成 `Svelte` 组件。这里有几块。让我们来看看它们。

首先，我们添加一个`<script>`带有我们需要的任何状态的标签。

我们还可以使用`<style>`标签带着我们想要的任何 `CSS`。这些样式在这里作用于组件 ，`<h1>`在内容这部分将是蓝色。模块化样式内置于 `Svelte` 中，无需任何外部库。使用 `React`，您通常需要使用第三方解决方案来实现样式模块化，例如`css-modules`、`styled-components`等（有数十种甚至数百种选择）。

然后是 `HTML` 标记。正如您所期望的那样，您需要学习一些 `HTML` 绑定，例如`{#if}`、`{#each}`等。这些特定于领域的语言功能似乎是从 `React` 退后一步，而那里的一切都是“just JavaScript”。但有几点值得注意：`Svelte`允许您将任意 `JavaScript`放入这些绑定中。所以这样的事情是完全有效的：

```
{#if childSubjects?.length}
```

如果你从 `Knockout` 或 `Ember` 跳入 React 并且从未再回去使用，这对你来说可能是一个（快乐的）惊喜。

此外，`Svelte` 处理其组件的方式与 `React` 非常不同。每当组件内的任何状态或父组件中的任何位置（除非您“记忆”）发生变化时，`React` 都会重新运行所有组件。这可能会变得效率低下，这就是为什么 `React` 提供诸如`useCallback`并`useMemo`防止不必要的数据重新计算之类的东西。

另一方面，`Svelte` 会分析您的模板，并在任何相关状态发生变化时创建有针对性的 `DOM`来更新代码。在上面的组件中，`Svelte`会看到`number`变化的地方，并能在变化后添加代码来更新`<h1>`文本。这意味着您永远不必担心记忆函数或对象。事实上，您甚至不必担心副作用依赖项，这一块我们稍后会谈到。

但首先，让我们谈谈……

## 状态管理

在 `React` 中，当我们需要管理状态时，我们使用`useState`钩子。我们为它提供一个初始值，它返回一个包含当前值的元组，以及一个我们可以用来设置新值的函数。它看起来像这样：

```js
import React, { useState } from "react";

export default function (props) {
  const [number, setNumber] = useState(0);
  return (
    <>
      <h1>Value: {number}</h1>
      <button onClick={() => setNumber(n => n + 1)}>Increment</button>
      <button onClick={() => setNumber(n => n - 1)}>Decrement</button>
    </>
  );
}
```

我们的`setNumber`函数可以传递到任何我们想要的地方，传递给子组件等。

如果放在`Svelte` 中的事情将更简单。我们可以创建一个变量，并根据需要更新它。`Svelte` 的提前编译（与 `React` 的即时编译相反）将完成跟踪更新位置的工作，并强制更新 `DOM`。上面相同的简单示例可能如下所示：

```
<script>
  let number = 0;
</script>

<h1>Value: {number}</h1>
<button on:click={() => number++}>Increment</button>
<button on:click={() => number--}>Decrement</button>
```

这里还需要注意的是，`Svelte` 不需要像 `JSX` 那样的单个包装元素。`Svelte` 没有像 `React` 片段`<></>`语法等效的语法，因为它不需要。

但是如果我们想将一个更新器函数传递给一个子组件以便它可以更新这个状态，就像我们在 `React` 中所做的那样，那么该如何弄呢？我们可以像这样编写更新程序函数：

```js
<script>
  import Component3a from "./Component3a.svelte";
        
  let number = 0;
  const setNumber = cb => number = cb(number);
</script>

<h1>Value: {number}</h1>

<button on:click={() => setNumber(val => val + 1)}>Increment</button>
<button on:click={() => setNumber(val => val - 1)}>Decrement</button>
```

现在，我们在需要的地方传递它——或者继续关注更自动化的解决方案。

## Reducers and stores

`React` 也有`useReducer`钩子，它允许我们对更复杂的状态进行建模。我们提供了一个 `reducer` 函数，它为我们提供了当前值，以及一个 `dispatch` 函数，它允许我们使用给定的参数调用 `reducer`，从而触发状态更新，无论 `reducer` 返回什么。我们上面的反例可能是这样的：

```js
import React, { useReducer } from "react";

function reducer(currentValue, action) {
  switch (action) {
    case "INC":
      return currentValue + 1;
    case "DEC":
      return currentValue - 1;
  }
}

export default function (props) {
  const [number, dispatch] = useReducer(reducer, 0);
  return (
    <div>
      <h1>Value: {number}</h1>
      <button onClick={() => dispatch("INC")}>Increment</button>
      <button onClick={() => dispatch("DEC")}>Decrement</button>
    </div>
  );
}
```

`Svelte` 并没有直接拥有这样的东西，但它所拥有的东西叫做`store`。最简单的存储类型是可写存储。它是一个持有价值的对象。要设置一个新值，你可以调用`store`里的`set` 并传递新值，或者你可以调用 `update` 并传入一个回调函数，它接收当前值并返回新值（就像 `React` 的`useState`）。

要在某个时刻读取`store`的当前值，可以调用一个`get`函数，该函数返回其当前值。`Stores` 也有一个 `subscribe` 函数，我们可以向它传递一个回调函数，它会在值改变时运行。

`Svelte` 是 `Svelte`，所有这些都有一些不错的语法快捷方式。例如，如果你在一个组件内部，你可以在 `store` 前面加上美元符号来读取它的值，或者直接分配给它来更新它的值。下面是上面的反例，使用 `store` 和一些额外的副作用日志来演示 `subscribe` 是如何工作的：

```js
<script>
  import { writable, derived } from "svelte/store";
        
  let writableStore = writable(0);
  let doubleValue = derived(writableStore, $val => $val * 2);
        
  writableStore.subscribe(val => console.log("current value", val));
  doubleValue.subscribe(val => console.log("double value", val))
</script>

<h1>Value: {$writableStore}</h1>

<!-- manually use update -->
<button on:click={() => writableStore.update(val => val + 1)}>Increment</button>
<!-- use the $ shortcut -->
<button on:click={() => $writableStore--}>Decrement</button>

<br />

Double the value is {$doubleValue}
```

请注意，我还在上面添加了一个派生的`store`。[https://svelte.dev/docs#derived]该文档对此进行了深入介绍，但简单地说，派生的`stores` 允许您使用与可写 `store` 相同的语义将一个 `store`（或多个 `store`）投影到单个新值。

`Svelte` 的`stores`非常灵活。我们可以将它们传递给子组件来改变、组合它们，甚至通过传递一个派生存储使它们成为只读；如果我们将一些 `React` 代码转换为`Svelte`，我们甚至可以重新创建一些您可能喜欢甚至需要的 `React` 抽象。

## React APIs with Svelte

抛开所有这些，让我们回到之前`React`的`useReducer`钩子。

假设我们真的很喜欢定义 `reducer` 函数来维护和更新状态。让我们看看利用 `Svelte` 的`stores`来模仿 `React` 的`useReducer` API 会有多困难。我们基本上想要调用我们自己的`useReducer`，传入一个带有初始值的 `reducer` 函数，并返回一个带有当前值的 `store`，以及一个调用 `reducer` 并更新我们的 `store` 的 `dispatch` 函数。把它拉下来实际上一点也不差。

```js
export function useReducer(reducer, initialState) {
  const state = writable(initialState);
  const dispatch = (action) =>
    state.update(currentState => reducer(currentState, action));
  const readableState = derived(state, ($state) => $state);

  return [readableState, dispatch];
}
```

`Svelte` 中的用法几乎与 `React` 相同。唯一的区别是我们的当前值是一个存储，而不是一个原始值，所以我们需要在它前面加上前缀`$`来读取值（或手动调用`get`或`subscribe在`在它上面）。

```js
<script>
  import { useReducer } from "./useReducer";
        
  function reducer(currentValue, action) {
    switch (action) {
      case "INC":
        return currentValue + 1;
      case "DEC":
        return currentValue - 1;
    }
  }
  const [number, dispatch] = useReducer(reducer, 0);      
</script>

<h1>Value: {$number}</h1>

<button on:click={() => dispatch("INC")}>Increment</button>
<button on:click={() => dispatch("DEC")}>Decrement</button>
```

## What about`useState`？

如果你真的喜欢`react`的`useState` 中的钩子，实现它同样简单。在实践中，我觉得它是一个有趣的练习，真正展示了 `Svelte` 的灵活性。

```js
export function useState(initialState) {
  const state = writable(initialState);
  const update = (val) =>
    state.update(currentState =>
      typeof val === "function" ? val(currentState) : val
    );
  const readableState = derived(state, $state => $state);

  return [readableState, update];
}
```

## Are two-way bindings really evil?

在结束这个状态管理部分之前，我想谈谈 `Svelte`特有的最后一个技巧。我们已经看到，`Svelte` 允许我们以我们可以使用 `React` 的任何方式将更新程序函数向下传递到组件树。这通常是为了允许子组件通知其父组件状态更改。我们都做过一百万次。子组件以某种方式更改状态，然后调用从父组件传递给它的函数，因此父组件可以知道该状态更改。

除了支持这种回调传递之外，`Svelte` 还允许父组件双向绑定到子组件的状态。例如，假设我们有这个组件：

```js
<!-- Child.svelte -->
<script>
  export let val = 0;
</script>

<button on:click={() => val++}>
  Increment
</button>

Child: {val}
```

这将创建一个带有`val`道具的组件。该`export`关键字是组件如何在`Svelte`声明道具。通常，使用`prop`时，我们将它们传递给组件，但在这里我们会做一些不同的事情。正如我们所见，这个 `prop` 被子组件修改。在 `React` 中，这段代码会出错且有缺陷，但使用 `Svelte`，渲染此组件的组件可以执行以下操作：

```js
<!-- Parent.svelte -->
<script>
  import Child from "./Child.svelte";
        
  let parentVal;
</script>

<Child bind:val={parentVal} />
Parent Val: {parentVal}
```

在这里，我们将父组件中的变量绑定到子组件的`val`道具。现在，当子组件的`val`道具改变时，我们`parentVal`将被 `Svelte` 自动更新。

双向绑定对某些人来说是有争议的。如果你讨厌它，那么无论如何，请随时不要使用它。在我眼里，我发现它是一个非常方便的工具来减少样板。

## `Svelte` 的副作用，没有眼泪（或陈旧的闭包）

在 `React` 中，我们使用`useEffect`钩子管理副作用。它看起来像这样：

```
useEffect(() => {
  console.log("Current value of number", number);
}, [number]);
```

我们在最后编写了带有依赖项列表的函数。在每次渲染时，`React` 检查列表中的每个项目，如果有任何与上次渲染存在引用不同，回调将重新运行。如果我们想在最后一次运行后进行清理，我们可以从效果中返回一个清理函数。

对于简单的事情，比如改变一个数字，这很容易。但是任何有经验的 `React` 开发人员都知道，`useEffect`对于非平凡的用例来说，这可能是非常困难的。意外地从依赖项数组中忽略某些内容并以陈旧的闭包结束，这是非常容易的。

在 `Svelte` 中，处理副作用的最基本形式是响应式语句，如下所示：

```
$: {
  console.log("number changed", number);
}
```

我们为代码块添加前缀`$:`，并将我们想要执行的代码放入其中。`Svelte` 分析读取了哪些依赖项，只要它们发生变化，`Svelte` 就会重新运行我们的块。没有直接的方法可以从上次运行反应块时开始运行清理，但是如果我们真的需要它，它就很容易解决：

```js
let cleanup;
$: {
  cleanup?.();
  console.log("number changed", number);
  cleanup = () => console.log("cleanup from number change");
}
```

不，这不会导致无限循环：从反应块内重新分配不会重新触发块。

虽然这是有效的，但通常这些清理效果需要在您的组件卸载时运行，而 `Svelte` 有一个为此内置的功能：它有一个`onMount`函数，它允许我们返回一个在组件销毁时运行的清理函数，甚至更直接的是，它还有一个`onDestroy`功能可以满足您的期望。

## 用行动来调味

以上所有工作都足够好，但 `Svelte` 确实因行动而闪耀。副作用经常与我们的 `DOM` 节点相关联。我们可能希望在 `DOM` 节点上集成一个旧的（但仍然很棒）的 `jQuery` 插件，并在该节点离开 `DOM` 时将其拆除。或者也许我们想`ResizeObserver`为一个节点设置一个，并在节点离开 `DOM` 时将其拆除等等。这是一个足够普遍的需求，`Svelte` 将其内置于`actions`中。让我们看看如何。

```
{#if show}
  <div use:myAction>
    Hello                
  </div>
{/if}
```

需注意的是`use:actionName`语法。在这里，我们将其`<div>`与名为`myAction` 的动作相关联，它只是一个函数。

```
function myAction(node) {
  console.log("Node added", node);
}
```

每当`<div>`进入 `DOM`时都会运行此操作，并将 `DOM` 节点传递给它。这是我们添加`jQuery` 插件并且设置我们的`ResizeObserver`等等的机会。不仅如此，我们还可以从中返回一个清理函数，如下所示：

```js
function myAction(node) {
  console.log("Node added", node);

  return {
    destroy() {
      console.log("Destroyed");
    }
  };
}
```

现在`destroy()`回调将在节点离开 `DOM` 时运行。这是我们拆除 `jQuery` 插件等等的地方。

## 但是等等，还有更多！

我们甚至可以将参数传递给动作，如下所示：

```
<div use:myAction={number}>
  Hello                
</div>
```

该参数将作为第二个参数传递给我们的动作函数：

```js
function myAction(node, param) {
  console.log("Node added", node, param);

  return {
    destroy() {
      console.log("Destroyed");
    }
  };
}
```

如果你想在参数改变时做额外的工作，你可以返回一个更新函数：

```js
function myAction(node, param) {
  console.log("Node added", node, param);

  return {
    update(param) {
      console.log("Update", param);
    },
    destroy() {
      console.log("Destroyed");
    }
  };
}
```

当我们操作的参数发生变化时，更新函数将运行。要将多个参数传递给一个动作，我们传递一个对象：

```html
<div use:myAction={{number, otherValue}}>
  Hello                
</div>
```

……只要对象的任何属性发生变化，`Svelte` 就会重新运行我们的更新函数。

`actions`是我最喜欢的 `Svelte` 功能之一；他们非常强大。

## Odds and Ends

`Svelte` 还提供了许多在 `React` 中没有的强大功能。有许多表单绑定（[https://svelte.dev/tutorial/text-inputs]教程涵盖了这些），以及 `CSS`助手。

来自 `React` 的开发人员可能会惊讶地发现 `Svelte` 还提供开箱即用的动画支持。它不是在 `npm` 上搜索并希望得到最好的结果，而是......内置的。它甚至包括对`弹簧物理`和`进入与退出动画`的支持，`Svelte` 将其称为`transitions`。

`Svelte` 的答案`React.Chidren`是插槽，可以命名也可以不命名，并且在 `Svelte`在(https://svelte.dev/docs#slot)文档中有很好的介绍。我发现它们比 `React`的 `Children API` 更容易推理。

最后，我最喜欢的 `Svelte` 几乎隐藏的功能之一是它可以将其组件编译为实际的 `Web` 组件。`svelte:options`有这个`tagName`属性。但一定要在 `webpack` 或 `Rollup` 配置中设置相应的属性。使用 `webpack`时，它看起来像这样：

```js
{
  loader: "svelte-loader",
  options: {
    customElement: true
  }
}
```

## 有兴趣尝试 `Svelte` 吗？

这些项目中的任何一个本身都会成为一篇很棒的博客文章。虽然我们可能只触及了状态管理和`actions`等事物的表面，但我们看到了 `Svelte` 的特性不仅与 `React` 非常匹配，而且甚至可以模仿 `React` 的许多 API。那是在我们简要介绍 `Svelte` 的方便性之前，例如内置动画（或过渡）以及将 `Svelte` 组件转换为真正的 Web 组件的能力。