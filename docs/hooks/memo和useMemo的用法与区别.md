# React.memo() 和 useMemo() 的用法与区别

> [https://mp.weixin.qq.com/s/zxT2GfujdbQfvrCtRxkbiQ](https://mp.weixin.qq.com/s/zxT2GfujdbQfvrCtRxkbiQ)

在软件开发中，我们通常痴迷于性能提升以及如何使我们的应用程序执行得更快，从而为用户提供更好的体验。

Memoization 是优化性能的方法之一。在本文中，我们将探讨它在 React 中的工作原理。

## **什么是 memoization？**

在解释这个概念之前，让我们先来看一个简单的斐波那契程序：

```js
function fibonacci(n){
  return (n < 2) ? n : fibonacci(n-1) + fibonacci(n-2);
}
```

显然这个算法缓慢的令人绝望，因为做了非常多的冗余计算，这个时候`memoization`就可以派上用场了。

简单来说，`memoization` 是一个过程，它允许我们缓存递归/昂贵的函数调用的值，以便下次使用相同的参数调用函数时，返回缓存的值而不必重新计算函数。

这确保了我们的应用程序运行得更快，因为我们通过返回一个已经存储在内存中的值来避免重新执行函数需要的时间。

## **为什么在 React 中使用 memoization？**

在 React 函数组件中，当组件中的 props 发生变化时，默认情况下整个组件都会重新渲染。换句话说，如果组件中的任何值更新，整个组件将重新渲染，包括尚未更改其 values/props 的函数/组件。

让我们看一个发生这种情况的简单示例。我们将构建一个基本的应用程序，告诉用户哪种酒最适合与它们选择的奶酪搭配。

我们将从设置两个组件开始。第一个组件将允许用户选择奶酪。然后它会显示最适合该奶酪的酒的名称。第二个组件将是第一个组件的子组件。在这个组件中，没有任何变化。我们将使用这个组件来跟踪 React 重新渲染的次数。

> 注意，本示例中使用的 `classNames` 来自 Tailwind CSS。

下面是我们的父组件：`<ParentComponent />`。

```js
// components/parent-component.js
import Counts from "./counts";
import Button from "./button";
import { useState, useEffect } from "react";
import constants from "../utils";
const { MOZARELLA, CHEDDAR, PARMESAN, CABERNET, CHARDONAY, MERLOT } = constants;

export default function ParentComponent() {
  const [cheeseType, setCheeseType] = useState("");
  const [wine, setWine] = useState("");
  const whichWineGoesBest = () => {
    switch (cheeseType) {
      case MOZARELLA:
        return setWine(CABERNET);
      case CHEDDAR:
        return setWine(CHARDONAY);
      case PARMESAN:
        return setWine(MERLOT);
      default:
        CHARDONAY;
    }
  };
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      whichWineGoesBest();
    }
    return () => (mounted = false);
  }, [cheeseType]);

  return (
    <div className="flex flex-col justify-center items-center">
        <h3 className="text-center dark:text-gray-400 mt-10">
          Without React.memo() or useMemo()
        </h3>
      <h1 className="font-semibold text-2xl dark:text-white max-w-md text-center">
        Select a cheese and we will tell you which wine goes best!
      </h1>
      <div className="flex flex-col gap-4 mt-10">
        <Button text={MOZARELLA} onClick={() => setCheeseType(MOZARELLA)} />
        <Button text={CHEDDAR} onClick={() => setCheeseType(CHEDDAR)} />
        <Button text={PARMESAN} onClick={() => setCheeseType(PARMESAN)} />
      </div>
      {cheeseType && (
        <p className="mt-5 dark:text-green-400 font-semibold">
          For {cheeseType}, <span className="dark:text-yellow-500">{wine}</span>{" "}
          goes best.
        </p>
      )}
      <Counts />
    </div>
  );
}
```

第二个组件是 `<Counts />` 组件，它跟踪整个 `<Parent Component />` 组件重新渲染的次数。

```js
// components/counts.js
import { useRef } from "react";
export default function Counts() {
  const renderCount = useRef(0);
  return (
    <div className="mt-3">
      <p className="dark:text-white">
        Nothing has changed here but I've now rendered:{" "}
        <span className="dark:text-green-300 text-grey-900">
          {(renderCount.current++)} time(s)
        </span>
      </p>
    </div>
  );
}
```

下面的例子是我们点击奶酪名字时的效果:

![图片](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCsgTzftWYvhdTTE8MZ0abzKRAthia2kJNhCxh5sT5m2P6BrhOgjNnskxjSibfdm7bo3zOgTegCVia61Q/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

`<ParentComponent />` 中的 `<Counts />` 组件计算了因 `<ParentComponent />` 的更改而强制 `<Counts />` 组件重新渲染的次数。

目前，单击奶酪名字将更新显示下面的奶酪名字以及酒名。除了 `<ParentComponent />` 会重新渲染，`<Counts />` 组件也会重新渲染，即使其中的任何内容都没有改变。

想象一下，有一个组件显示数以千计的数据，每次用户单击一个按钮时，该组件或树中的每条数据都会在不需要更新时重新渲染。这就是 `React.memo()` 或 `useMemo()` 为我们提供性能优化所必需的地方。

现在，让我们探索 `React.memo` 以及 `useMemo()`。之后我们将比较它们之间的差异，并了解何时应该使用一种而不是另一种。

## **什么是 React.memo()？**

`React.memo()` 随 React v16.6 一起发布。虽然类组件已经允许您使用 PureComponent 或 shouldComponentUpdate 来控制重新渲染，但 React 16.6 引入了对函数组件执行相同操作的能力。

`React.memo()` 是一个高阶组件 (HOC**)，**它接收一个组件A作为参数并返回一个组件B，如果组件B的 props（或其中的值）没有改变，则组件 B 会阻止组件 A 重新渲染 。

我们将采用上面相同的示例，但在我们的 `<Counts />` 组件中使用 `React.memo()`。我们需要做的就是用 `React.memo()` 包裹我们的 `<Counts />`组件，如下所示：

```js
import { useRef } from "react";
function Counts() {
  const renderCount = useRef(0);
  return (
    <div className="mt-3">
      <p className="dark:text-white">
        Nothing has changed here but I've now rendered:{" "}
        <span className="dark:text-green-300 text-grey-900">
          {(renderCount.current ++)} time(s)
      </span>
      </p>
    </div>
  );
}
export default React.memo(Counts);
```

现在，当我们通过单击选择奶酪类型时，我们的 `<Counts />` 组件将不会重新渲染。

![图片](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCsgTzftWYvhdTTE8MZ0abzKVE1Ea4WtYRjwhV4NMPo5iaA3OVKkf4bJEpcVyaOCMiaDbTLnWD5Ic0RQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)





## **什么是 useMemo()？**

`React.memo()` 是一个 HOC，而 `**useMemo()**` 是一个 React Hook。使用 `useMemo()`，我们可以返回记忆值来避免函数的依赖项没有改变的情况下重新渲染。

为了在我们的代码中使用 `useMemo()`，React 开发者有一些建议给我们：

- **您可以依赖** `useMemo()` **作为性能优化，而不是语义保证**
- **函数内部引用的每个值也应该出现在依赖项数组中**

对于我们的下一个示例，我们将对 `<ParentComponent />` 进行一些更改。下面的代码仅显示对我们之前创建的 `<ParentComponent />` 的新更改。

```js
// components/parent-component.js
.
.
import { useState, useEffect, useRef, useMemo } from "react";
import UseMemoCounts from "./use-memo-counts";

export default function ParentComponent() {
  .
  .
  const [times, setTimes] = useState(0);
  const useMemoRef = useRef(0);

  const incrementUseMemoRef = () => useMemoRef.current++;

  // uncomment the next line to test that <UseMemoCounts /> will re-render every t ime the parent re-renders.
  // const memoizedValue = useMemoRef.current++;

// the next line ensures that <UseMemoCounts /> only renders when the times value changes
const memoizedValue = useMemo(() => incrementUseMemoRef(), [times]);

  .
  .

  return (
    <div className="flex flex-col justify-center items-center border-2 rounded-md mt-5 dark:border-yellow-200 max-w-lg m-auto pb-10 bg-gray-900">
      .
      .
        <div className="mt-4 text-center">
          <button
            className="bg-indigo-200 py-2 px-10 rounded-md"
            onClick={() => setTimes(times+1)}
          >
            Force render
          </button>

          <UseMemoCounts memoizedValue={memoizedValue} />
        </div>
    </div>
  );
}
```

首先，我们引入了非常重要的 `useMemo()` Hook。我们还引入了 `useRef()` Hook 来帮助我们跟踪在我们的组件中发生了多少次重新渲染。接下来，我们声明一个 `times` 状态，稍后我们将更新该状态来触发/强制重新渲染。

之后，我们声明一个 `memoizedValue` 变量，用于存储 `useMemo()` Hook 的返回值。`useMemo()` Hook 调用我们的 `incrementUseMemoRef` 函数，它会在每次依赖项发生变化时将我们的 `useMemoRef.current` 值加一，即 `times` 值发生变化。

然后我们创建一个按钮来点击更新`times`的值。单击此按钮将触发我们的 `useMemo()` Hook，更新 `memoizedValue` 的值，并重新渲染我们的 `<UseMemoCounts />` 组件。

在这个例子中，我们还将 `<Counts />` 组件重命名为 `<UseMemoCounts />`，它现在需要一个 `memoizedValue` 属性。

这是它的样子：

```js
// components/use-memo-counts.js

function UseMemoCounts({memoizedValue}) {
  return (
    <div className="mt-3">
      <p className="dark:text-white max-w-md">
        I'll only re-render when you click <span className="font-bold text-indigo-400">Force render.</span> 
        </p>
      <p className="dark:text-white">I've now rendered: <span className="text-green-400">{memoizedValue} time(s)</span> </p>
    </div>
  );
}
export default UseMemoCounts;
```

现在，当我们单击任何奶酪按钮时，我们的 `memoizedValue` 不会更新。但是当我们单击 **Force render** 按钮时，我们看到 `memoizedValue` 更新并且 `<UseMemoCounts />` 组件重新渲染。

![图片](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCsgTzftWYvhdTTE8MZ0abzKah78nEaO3rEzzCxnkp3t1K3TNGOYEMM7eZd65YQ1Ta9wP5xUXxTib4A/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

如果注释掉我们当前的 memoizedValue行，并取消注释掉它上面的行：

```js
const memoizedValue = useMemoRef.current++;
```

将看到 `<UseMemoCounts />` 组件在每次 `<ParentComponent />` 渲染时重新渲染。

## **总结：React.memo() 和 useMemo() 的主要区别**

从上面的例子中，我们可以看到 `React.memo()` 和 `useMemo()` 之间的主要区别：

- `**React.memo()**` **是一个高阶组件，我们可以使用它来包装我们不想重新渲染的组件，除非其中的 props 发生变化。**
- `**useMemo()**` **是一个 React Hook，我们可以使用它在组件中包装函数。我们可以使用它来确保该函数中的值仅在其依赖项之一发生变化时才重新计算。**

虽然 memoization 似乎是一个可以随处使用的巧妙小技巧，但只有在绝对需要这些性能提升时才应该使用它。Memoization 会占用运行它的机器上的内存空间，因此可能会导致意想不到的效果。

