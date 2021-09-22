# 【React的作弊模式】理解useReducer的优势和高级用法

或许你已经知道，当多个state需要一起更新时，就应该考虑使用`useReducer`；

或许你也已经听说过，使用`useReducer`能够提高应用的性能。

但是篇文章希望帮助你理解：为什么`useReducer`能提高代码的可读性和性能，以及如何在`reducer`中读取`props`的值。

由于`useReducer`造就的解耦模式以及高级用法，React团队的Dan Abramov将useReducer描述为["React的作弊模式"](https://twitter.com/dan_abramov/status/1102010979611746304)。

## useReducer的优势

举一个例子：

```js
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step); // 依赖其他state来更新
    }, 1000);
    return () => clearInterval(id);
    // 为了保证setCount中的step是最新的，
    // 我们还需要在deps数组中指定step
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

这段代码能够正常工作，但是随着相互依赖的状态变多，**setState中的逻辑会变得很复杂**，**useEffect的deps数组也会变得更复杂**，降低可读性的同时，useEffect重新执行时机变得更加**难以预料**。

使用useReducer替代useState以后：

```js
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { count, step } = state;

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
      }, 1000);
    return () => clearInterval(id);
  }, []); // deps数组不需要包含step

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  )
}
```

**现在组件只需要发出action，而无需知道如何更新状态**。也就是将**What to do**与**How to do**解耦。彻底解耦的标志就是：useReducer总是返回**相同的dispatch函数**（发出action的渠道），不管reducer（状态更新的逻辑）如何变化。

> 这是useReducer的逆天之处之一，下面会详述

另一方面，step的更新不会造成useEffect的失效、重执行。因为现在useEffect依赖于dispatch，而不依赖于**状态值**（得益于上面的解耦模式）。**这是一个重要的模式，能用来避免useEffect、useMemo、useCallback需要频繁重执行的问题**。

以下是state的定义，其中reducer封装了“如何更新状态”的逻辑：

```js
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

总结：

- 当状态更新逻辑比较复杂的时候，就应该考虑使用useReducer。因为：
  - **reducer比setState更加擅长描述“如何更新状态”**。比如，reducer能够读取相关的状态、同时更新多个状态。
  - 【组件负责发出action，reducer负责更新状态】的解耦模式，使得代码逻辑变得更加清晰，代码行为更加可预测(比如useEffect的更新时机更加稳定)。
  - 简单来记，就是每当编写`setState(prevState => newState)`的时候，就应该考虑是否值得将它换成useReducer。
- **通过传递useReducer的dispatch，可以减少状态值的传递**。
  - useReducer总是返回**相同的dispatch函数**，这是彻底解耦的标志：状态更新逻辑可以任意变化，而发起actions的渠道始终不变
  - 得益于前面的解耦模式，useEffect函数体、callback function只需要使用dispatch来发出action，而无需直接依赖**状态值**。因此在useEffect、useCallback、useMemo的deps数组中无需包含**状态值**，也减少了它们更新的需要。不但能提高可读性，而且能提升性能（useCallback、useMemo的更新往往会造成子组件的刷新）。

## 高级用法：内联reducer

你可以将reducer声明在组件内部，从而能够通过闭包访问props、以及前面的hooks结果：

```js
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);
  function reducer(state, action) {
    if (action.type === 'tick') {
      // 可以通过闭包访问到组件内部的任何变量
      // 包括props，以及useReducer之前的hooks的结果
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

这个能力可能会出乎很多人的意料。因为大部分人对`reducer`的触发时机的理解是错误的（包括以前的我）。我以前理解的触发时机是这样：

1. 某个button被用户点击，它的`onClick`被调用，其中执行了`dispatch({type:'add'})`，React框架安排一次更新
2. React框架处理刚才安排的更新，调用`reducer(prevState, {type:'add'})`，来得到新的状态
3. React框架用新的状态来渲染组件树，渲染到`Counter`组件的`useReducer`时，返回上一步得到的新状态即可

但是实际上，React会**在下次渲染的时候**再调用`reducer`来处理`action：`

1. 某个button被用户点击，它的onClick被调用，其中执行了`dispatch({type:'add'})`，React框架安排一次更新
2. React框架处理刚才安排的更新，开始重渲染组件树
3. 渲染到`Counter`组件的`useReducer`时，调用`reducer(prevState, {type:'add'})` ，处理之前的action

重要的区别在于，reducer是在**下次渲染**的时候被调用的，它的闭包捕获到了**下次渲染**的props。

> 如果按照上面的错误理解，reducer是在下次渲染之前被调用的，它的闭包捕获到上次渲染的props(因为更新渲染还没开始呢)

事实上，如果你简单地使用`console.log`来打印执行顺序，会发现**reducer是在新渲染执行useReducer的时候被同步执行的**：

```js
  console.log("before useReducer");
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("after useReducer", state);

  function reducer(prevState, action) {
    // these current state var are not initialized yet
    // would trigger error if not transpiled to es5 var
    console.log("reducer run", state, count, step);
    return prevState;
  }
```

调用`dispatch`以后会输出：

```
before useReducer
reducer undefined undefined undefined
after useReducer {count: 1, step: 1}
```

证明`reducer`确实被`useReducer`同步地调用来获取新的state。
[codesandbox demo](https://codesandbox.io/s/reducer-trigger-timming-wukxw?file=/src/index.js)

