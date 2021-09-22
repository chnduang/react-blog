# React 组件性能优化—function component

> [https://mp.weixin.qq.com/s/U4dKSNfD1dPsMemu_HAaqA](https://mp.weixin.qq.com/s/U4dKSNfD1dPsMemu_HAaqA)

# 1. 前言

函数式组件是一种非常简洁的数据驱动 UI 的实现方式。如果将 React 组件拆分成三个部分 —— 数据、计算和渲染，我们可以看到性能优化的几个方向。

![图片](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCv3wqhIVIl3Swtl0YTVVYtPYtAt6oNpcrRWyrFI1u8PSg0v9P53pkUHc4L5Z9bn03hicMcbax8zuSQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- 数据：利用缓存，减少 `rerender` 的次数
- 计算：精确判断更新时机和范围，减少计算量
- 渲染：精细粒度，降低组件复杂度

今天主要分享数据层面的性能优化技巧。

## 1.1. 有什么是 Hook 能做而 class 做不到的？

在学习 React `hook api` 的过程中，发现其相比类组件的生命周期，更加抽象且灵活。在 React 官方文档的 `FAQ` 中，有一个非常有趣的问题 —— **`有什么是 Hook 能做而 class 做不到的？`**

前阵子我终于找到了其中一个 `参考答案` ，此前在开发一个需求时，需要通过 url 或缓存传递一个 `参数` 给新打开的 `Tab`。当 `Tab` 下的页面开始加载时，会去读取这个 `参数`，并且使用它去做一些请求，获取更多的信息进行渲染。

最初拿到这个需求时，我使用了 `类组件` 去开发，但实践过程中发现编写出的代码不易理解和管理。最后重构为 `函数式组件`，让代码简洁了许多。

## 1.2. 一个不好的 🌰（ `getDerivedStateFromProps` + `componentDidUpdate` ） 

最初我通过 `getDerivedStateFromProps` 和 `componentDidUpdate` 这两个生命周期。其中 `getDerivedStateFromProps` 去实现 `props` 的前后对比， `componentDidUpdate` 控制组件去请求和更新。

首先我们有一个来自于 url 和缓存的参数，叫做 `productId`，也可以叫做 `商品id`，它在发生更新后如何通知父组件，这一点我们不需要在意。现在父组件被通知 `商品id` 发生了更新，于是通过 `props` 将其传递给了子组件，也就是我们的页面容器。

```
function Parent() {
  /**
   * 通过某种方式，监听到 productId 更新了
   */
  return <Child productId={productId} />
}
```

在父组件改变 `props` 中的 `商品id` 时，我们的子组件通过 `getDerivedStateFromProps` 去监听，经过一段比较逻辑，发生改变则更新 `state` 触发组件的重新渲染。

```
// 监听 props 变化，触发组件重新渲染
static getDerivedStateFromProps(nextProps, prevState) {
  const { productId } = nextProps;
  // 当传入的 productId 与 state 中的不一致时，更新 state
  if (productId !== prevState.productId) {
    // 更新 state，触发重新渲染
    return { productId };
  }
  return null;
}
```

接下来，因为 `商品id` 发生了更新，组件需要再发一次请求去更新并重新渲染 `商品` 的详情信息。

```
componentDidUpdate(prevProps, prevState) {
  /**
   * state 改变，重新请求
   * PS: 细心的你可能发现这里又跟旧的 state 比较了一次
   */
  if (prevState.productId !== this.state.productId) {
    this.getProductDetailRequest();
  }
}

getProductDetailRequest = async () => {
  const { productId } = this.state;

  // 用更新后的 productId 去请求商品详情
  const { result } = await getProductDetail({
    f_id: +productId,
  });

  // setState 重新渲染商品详情
  this.setState({
    productDetail: result,
  });
};
```

到这里就实现了我们的需求，但这份代码其实有很多不值得参考的地方：

1、`componentDidUpdate` 中的 `setState` —— 出于更新 UI 的需要，在 `componentDidUpdate` 中又进行了一次 `setState`，其实是一种危险的写法。假如没有包裹任何条件语句，或者条件语句有漏洞，组件就会进行循环更新，隐患很大。

2、**分散在两个生命周期中的两次数据比较** —— 在一次更新中发生了两次 `state` 的比较，虽然性能上没有太大影响，但这意味着修改代码时，要同时维护两处。假如比较逻辑非常复杂，那么改动和测试都很困难。

3、**代码复杂度** —— 仅仅是 demo 就已经编写了很多代码，不利于后续开发者理解和维护。

## 1.3. 另一个不好的 🌰（ `componentWillReceiveProps` ）

上面的 🌰 中，导致我们必须使用 `componentDidUpdate` 的一个主要原因是，`getDerivedStateFromProps` 是个静态方法，不能调用类上的 `this`，异步请求等副作用也不能在此使用。

![图片](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCv3wqhIVIl3Swtl0YTVVYtPZVwUwp8tsPBiaQwrb4Hk30ysPrV7H4vGUFVX9J5qHmbOwB3nNUGZBIw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

为此，我们不妨使用 `componentWillReceiveProps` 来实现，在获取到 `props` 的时候就能直接发起请求，并且 `setState`。

```
componentWillReceiveProps(props) {
  const { productId } = props;
  if (`${productId}` === 'null') {
    // 不请求
    return;
  }
  if (productId !== this.state.productId) {
    // 商品池详情的id发生改变，重新进行请求
    this.getProductDetailRequest(productId);
  }
}
```

将逻辑整合到一处，既实现了可控的更新，又能少写很多代码。

但这仅限 `React 16.4` 之前。

## 1.4. class component 的副作用管理之难

面临上述需求的时候，我们借助了两种方案，但各有缺点。

- `componentWillReceiveProps`：

  `React 16.4` 中将 `componentWillReceiveProps` 定义为了 `unsafe` 的方法，因为这个方法容易被开发者滥用，引入很多副作用。

  正如 [React 官方文档_unsafe_componentwillreceiveprops](https://mp.weixin.qq.com/s?__biz=MzI1ODE4NzE1Nw==&mid=2247490621&idx=1&sn=bc3e3ae132985648a2822e38035423f4&chksm=ea0d56c7dd7adfd15934fdbc8bf0218df50353d86196d306dd393f5365aa6f7850c8f75e5c21&mpshare=1&scene=1&srcid=0906S3TuvxMbeos9HLCgnisj&sharer_sharetime=1630926370848&sharer_shareid=127a669cda28f5e879b4b19ecc7309ed&key=8adf9203f7a8000d2840f553bc5f01381b3f0da9305adf7a5211b630069ee9e56fec6e11200984cd1a8af7b711ba9ea1eaa9ac2c5c30995ff26e96f2069e64768f2730d04c46e1770f6101ae321c194aa31c84376dc55f1a6eeb3902c2ae63dd12dff5eed45cce1c490c16269217b0f7870aafefa71cf74c1dc314f863135a65&ascene=1&uin=MTE5NzkwMDQyOA%3D%3D&devicetype=iMac+MacBookPro16%2C1+OSX+OSX+10.16+build(20G95)&version=13010510&nettype=WIFI&lang=zh_CN&fontScale=100&exportkey=AdoErQssmoFO2HXgzKwwo0k%3D&pass_ticket=fLP9V92MomGzP9pH3KLEfsm3bnRI8zfMRwFVqIdz48ri7Mz%2F8fv7z1lJc2RQBBLc&wx_header=0&fontgear=3.000000) 提到的，副作用通常建议发生在 `componentDidUpdate`。但这会造成多一次的渲染，且写法诡异。

- `getDerivedStateFromProps` 和 `componentDidUpdate`：

  作为替代方案的 `getDerivedStateFromProps` 是个静态方法，也需要结合 `componentDidUpdate`，判断是否需要进行必要的 `render`，本质上没有发生太多改变。

  `getDerivedStateFromProps` 可以认为是增加了静态方法限制的 `componentWillReceiveProps`，它们在生命周期中触发的时机是相似的，都起到了接收新的 `props` 并更新的作用。

甚至当依赖项增多的时候，上述两种方式将会提升代码的复杂度，我们会耗费大量的精力去思考状态的比较以及副作用的管理。而 `React 16.8` 之后的 `函数式组件` 和 `hook api`，很好地解决了这一痛点。看看使用了 `函数式组件` 是怎样的：

```
function Child({ productId }) {
  const [productDetail, setProductDetail] = useState({});
  useEffect(() => {
    const { result } = await getProductDetail({
      f_id: +productId,
    });
    setProductDetail(result);
  }, [productId]);

  return <>......</>;
}
```

相比上面两个例子，是不是简单得多？上面的 `useEffect()` 通过指定依赖项的方式，把令人头疼的副作用进行了管理，仅在依赖项改变时才会执行。

到这里，我们已经花了很长的篇幅去突出 `函数式组件` 的妙处。我们能够发现，`函数式组件` 可以让我们更多地去关注数据驱动，而不被具体的生命周期所困扰。在 `函数式组件` 中，结合 `hook api`，也可以很好地观察组件性能优化的方向。

这里我们从数据缓存的层面，介绍一下函数式组件的三个性能优化方式 —— `React.memo`、`useCallback` 和 `useMemo`。

## 2. 函数式组件性能优化 

## 2.1. 纯组件(Pure Componet)

纯组件（Pure Component）来源于函数式编程中纯函数（Pure Function）的概念，纯函数符合以下两个条件：

- 其返回值仅由其输入值决定
- 对于相同的输入值，返回值始终相同

类似的，如果 React 组件**为相同的 state 和 props 呈现相同的输出**，则可以将其视为纯组件。

### 2.1.1. 浅层比较

根据数据类型，浅层比较分为两种：

- 基本数据类型：比较值是否相同
- 引用数据类型：比较内存中的引用地址是否相同

浅层比较这一步是优先于 diff 的，能够从上游阻止重新 render。同时浅层比较只比较组件的 state 和 props，消耗更少的性能，不会像 diff 一样重新遍历整颗虚拟 DOM 树。

浅层比较也叫 [shallow compare](https://mp.weixin.qq.com/s?__biz=MzI1ODE4NzE1Nw==&mid=2247490621&idx=1&sn=bc3e3ae132985648a2822e38035423f4&chksm=ea0d56c7dd7adfd15934fdbc8bf0218df50353d86196d306dd393f5365aa6f7850c8f75e5c21&mpshare=1&scene=1&srcid=0906S3TuvxMbeos9HLCgnisj&sharer_sharetime=1630926370848&sharer_shareid=127a669cda28f5e879b4b19ecc7309ed&key=8adf9203f7a8000d2840f553bc5f01381b3f0da9305adf7a5211b630069ee9e56fec6e11200984cd1a8af7b711ba9ea1eaa9ac2c5c30995ff26e96f2069e64768f2730d04c46e1770f6101ae321c194aa31c84376dc55f1a6eeb3902c2ae63dd12dff5eed45cce1c490c16269217b0f7870aafefa71cf74c1dc314f863135a65&ascene=1&uin=MTE5NzkwMDQyOA%3D%3D&devicetype=iMac+MacBookPro16%2C1+OSX+OSX+10.16+build(20G95)&version=13010510&nettype=WIFI&lang=zh_CN&fontScale=100&exportkey=AdoErQssmoFO2HXgzKwwo0k%3D&pass_ticket=fLP9V92MomGzP9pH3KLEfsm3bnRI8zfMRwFVqIdz48ri7Mz%2F8fv7z1lJc2RQBBLc&wx_header=0&fontgear=3.000000)，在 [`React.memo`](https://mp.weixin.qq.com/s?__biz=MzI1ODE4NzE1Nw==&mid=2247490621&idx=1&sn=bc3e3ae132985648a2822e38035423f4&chksm=ea0d56c7dd7adfd15934fdbc8bf0218df50353d86196d306dd393f5365aa6f7850c8f75e5c21&mpshare=1&scene=1&srcid=0906S3TuvxMbeos9HLCgnisj&sharer_sharetime=1630926370848&sharer_shareid=127a669cda28f5e879b4b19ecc7309ed&key=8adf9203f7a8000d2840f553bc5f01381b3f0da9305adf7a5211b630069ee9e56fec6e11200984cd1a8af7b711ba9ea1eaa9ac2c5c30995ff26e96f2069e64768f2730d04c46e1770f6101ae321c194aa31c84376dc55f1a6eeb3902c2ae63dd12dff5eed45cce1c490c16269217b0f7870aafefa71cf74c1dc314f863135a65&ascene=1&uin=MTE5NzkwMDQyOA%3D%3D&devicetype=iMac+MacBookPro16%2C1+OSX+OSX+10.16+build(20G95)&version=13010510&nettype=WIFI&lang=zh_CN&fontScale=100&exportkey=AdoErQssmoFO2HXgzKwwo0k%3D&pass_ticket=fLP9V92MomGzP9pH3KLEfsm3bnRI8zfMRwFVqIdz48ri7Mz%2F8fv7z1lJc2RQBBLc&wx_header=0&fontgear=3.000000)或 [`React.PureComponent`](https://mp.weixin.qq.com/s?__biz=MzI1ODE4NzE1Nw==&mid=2247490621&idx=1&sn=bc3e3ae132985648a2822e38035423f4&chksm=ea0d56c7dd7adfd15934fdbc8bf0218df50353d86196d306dd393f5365aa6f7850c8f75e5c21&mpshare=1&scene=1&srcid=0906S3TuvxMbeos9HLCgnisj&sharer_sharetime=1630926370848&sharer_shareid=127a669cda28f5e879b4b19ecc7309ed&key=8adf9203f7a8000d2840f553bc5f01381b3f0da9305adf7a5211b630069ee9e56fec6e11200984cd1a8af7b711ba9ea1eaa9ac2c5c30995ff26e96f2069e64768f2730d04c46e1770f6101ae321c194aa31c84376dc55f1a6eeb3902c2ae63dd12dff5eed45cce1c490c16269217b0f7870aafefa71cf74c1dc314f863135a65&ascene=1&uin=MTE5NzkwMDQyOA%3D%3D&devicetype=iMac+MacBookPro16%2C1+OSX+OSX+10.16+build(20G95)&version=13010510&nettype=WIFI&lang=zh_CN&fontScale=100&exportkey=AdoErQssmoFO2HXgzKwwo0k%3D&pass_ticket=fLP9V92MomGzP9pH3KLEfsm3bnRI8zfMRwFVqIdz48ri7Mz%2F8fv7z1lJc2RQBBLc&wx_header=0&fontgear=3.000000)出现之前，常用于 `shouldComponentUpdate` 中的比较。

### 2.1.2. 纯组件 api

对组件输入的数据进行浅层比较，如果当前输入的数据和上一次相同，那么组件就不会重新渲染。相当于，在类组件的 `shouldComponentUpdate()` 中使用浅层比较，根据返回值来判断组件是否需要渲染。

纯组件适合定义那些 `props` 和 `state` 简单的组件，实现上可以总结为：**类组件继承 PureComponent 类，函数组件使用 memo 方法**。

### 2.1.3. PureComponent

`PureComponent` 不需要开发者自己实现 `shouldComponentUpdate()`，就可以进行简单的判断，但仅限浅层比较。

```
import React, { PureComponent } from 'react';

class App extends PureComponent {}
export default App;
```

假如依赖的引用数据发生了深层的变化，页面将不会得到更新，从而出现和预期不一致的 UI。当 props 和 state 复杂，需要深层比较的时候，我们更推荐在 Component 中自行实现 `shouldComponentUpdate()`。

此外，`React.PureComponent` 中的 `shouldComponentUpdate()` 将跳过所有子组件树的 prop 更新。因此，请确保所有子组件也都是纯组件。

### 2.1.4. React.memo

React.memo 是一个高阶组件，接受一个组件作为参数返回一个新的组件。新的组件仅检查 props 变更，会将当前的 props 和 上一次的 props 进行浅层比较，相同则阻止渲染。

```
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  memo 的第二个参数
  可以传入自定义的比较逻辑（仅比较 props），例如实现深层比较
  ps：与 shouldComponentUpdate 的返回值相反，该方法返回 true 代表的是阻止渲染，返回 false 代表的是 props 发生变化，应当重新渲染
  */
}
export default React.memo(MyComponent, areEqual);
```

所以对于函数式组件来说，若实现中拥有 `useState`、`useReducer` 或 `useContext` 等 Hook，当 `state` 或 `context` 发生变化时，即使 props 比较相同，组件依然会重新渲染。所以 React.memo，或者说纯组件，更适合用于 `renderProps()` 的情况，通过记忆输入和渲染结果，来提高组件的性能表现。

### 2.1.5. 总结

将类组件和函数组件改造为纯组件，更为便捷的应该是函数组件。`React.memo()` 可以通过第二个参数自定义比较的逻辑，以高阶函数的形式对组件进行改造，更加灵活。

## 2.2. useCallback

在函数组件中，当 `props` 传递了回调函数时，可能会引发子组件的重复渲染。当组件庞大时，这部分不必要的重复渲染将会导致性能问题。

```
// 父组件传递回调
const Parent = () => {
   const [title, setTitle] = useState('标题');
   const callback = () => { 
     /* do something to change Parent Component‘s state */
     setTitle('改变标题');
   };
   return (
      <>
              <h1>{title}</h1>
         <Child onClick={callback} />
      </>
   )
}

// 子组件使用回调
const Child = () => {
   /* onClick will be changed after Parent Component rerender */const { onClick } = props;
   return (
      <>
         <button onClick={onClick} >change title</button>
      </>
   )
}
```

props 中的回调函数经常是我们会忽略的参数，执行它时为何会引发自身的改变呢？这是因为回调函数执行过程中，耦合了父组件的状态变化，进而触发父组件的重新渲染，此时对于函数组件来说，会重新执行回调函数的创建，因此给子组件传入了一个新版本的回调函数。

解决这个问题的思路和 `memo` 是一样的，我们可以通过 `useCallback` 去包装我们即将传递给子组件的回调函数，返回一个 memoized 版本，仅当某个依赖项改变时才会更新。

```
// 父组件传递回调
const Parent = () => {
   const [title, setTitle] = useState('标题');
   const callback = () => { 
     /* do something to change Parent Component‘s state */
     setTitle('改变标题');
   };
   const memoizedCallback = useCallback(callback, []);
   return (
      <>
              <h1>{title}</h1>
         <Child onClick={memoizedCallback} />
      </>
   )
}

// 子组件使用回调
const Child = (props) => {
   /* onClick has been memoized */const { onClick } = props;
   return (
      <>
         <button onClick={onClick} >change title</button>
      </>
   )
}
```

此外，使用上， `useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。

## 2.3. useMemo

`React.memo()` 和 `useCallback` 都通过保证 `props` 的稳定性，来减少重新 render 的次数。而减少数据处理中的重复计算，就需要依靠 `useMemo` 了。

首先需要明确，`useMemo` 中不应该有其他与渲染无关的逻辑，其包裹的函数应当专注于处理我们需要的渲染结果，例如说 UI 上的文本、数值。其他的一些逻辑如请求，应当放在 `useEffect` 去实现。

```
function computeExpensiveValue() {
  /* a calculating process needs long time */
  return xxx
}

const memoizedValue = useMemo(computeExpensiveValue, [a, b]);
```

如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值。

以阶乘计算为例：

```
export function CalculateFactorial() {
  const [number, setNumber] = useState(1);
  const [inc, setInc] = useState(0);

  // Bad —— calculate again and console.log('factorialOf(n) called!');
  // const factorial = factorialOf(number);
  
  // Good —— memoized
  const factorial = useMemo(() => factorialOf(number), [number]);

  const onChange = event => {
    setNumber(Number(event.target.value));
  };
  const onClick = () => setInc(i => i + 1);
  
  return (
    <div>
      Factorial of 
      <input type="number" value={number} onChange={onChange} />
      is {factorial}
      <button onClick={onClick}>Re-render</button>
    </div>
  );
}

function factorialOf(n) {
  console.log('factorialOf(n) called!');
  return n <= 0 ? 1 : n * factorialOf(n - 1);
}
```

经过 `useMemo` 封装，`factorial` 成为了一个记忆值。当我们点击重新渲染的按钮时，`inc` 发生了改变引起函数式组件的 rerender，但由于依赖项 `number` 未发生改变，所以 `factorial` 直接返回了记忆值。

# 3. 总结

1、通过 函数式组件 结合 hook api，能够以更简洁的方式管理我们的副作用，在涉及到类似前言的问题时，更推荐把组件改造成函数式组件。

2、用一个通俗的说法去区分 `React.memo` 、`useCallback` 和 `useMemo` ， 那大概就是：

- `React.memo()` ：缓存虚拟 DOM（组件 UI）
- `useCallback` ：缓存函数
- `useMemo` ：缓存值