## 如何使用 React.useMemo() 进行快速记忆？

> [https://mp.weixin.qq.com/s/5xkJm_2hRTxiF9AJQt-B0w](https://mp.weixin.qq.com/s/5xkJm_2hRTxiF9AJQt-B0w)

![图片](https://mmbiz.qpic.cn/mmbiz_png/e93fo6YQKNnQPNBENiaibicGGhM0k0lCo0WXVicia0VfsAFTMWvAnahsaUrmI4YAbpd3ZBibDnJLY69nbQoXysic0pdVA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

原文：https://dmitripavlutin.com/react-usememo-hook/



有时 React 组件必须进行昂贵的计算。例如，给定一个很大的雇员列表和一个搜索查询，该组件需要通过查询过滤雇员的姓名。在这种情况下，您可以小心地尝试使用 Memoization 技术来提高组件的性能。在这篇文章中，作者将描述如何以及何时使用 useMemo() React Hook。



**UserMemo() Hook
**

------



useMemo()是一个内置的 React Hook， 它接受2个参数：一个compute 计算函数和depedencies数组。

- 

```
const memoizedResult = useMemo(compute, dependencies);
```

在初始渲染期间，useMemo( compute, dependencies ) 调用 compute，记忆计算结果，并将其返回给组件。



如果在下一次渲染期间依赖项没有改变，则 useMemo() 不会调用 compute 但返回记忆值。



但是，如果在重新渲染期间依赖项发生变化，则 useMemo() 调用 compute，记忆新值并返回它。这就是 useMemo() 钩子的本质。



如果您的计算回调使用 props 或 state 值，请确保将这些值指示为依赖项：

- 
- 
- 

```
const memoizedResult = useMemo(() => {  return expensiveFunction(propA, propB);}, [propA, propB]);
```

现在让我们通过一个例子，看一下 useMemo() 是如何工作的。



**useMemo() 案例**

------



组件<CalculateFactorial /> 计算引入输入字段数字的阶乘。

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
- 
- 
- 
- 
- 
- 
- 

```
import { useState } from 'react';
export function CalculateFactorial() {  const [number, setNumber] = useState(1);  const [inc, setInc] = useState(0);
  const factorial = factorialOf(number);
  const onChange = event => {    setNumber(Number(event.target.value));  };  const onClick = () => setInc(i => i + 1);    return (    <div>      Factorial of       <input type="number" value={number} onChange={onChange} />      is {factorial}      <button onClick={onClick}>Re-render</button>    </div>  );}
function factorialOf(n) {  console.log('factorialOf(n) called!');  return n <= 0 ? 1 : n * factorialOf(n - 1);}
```

![图片](https://mmbiz.qpic.cn/mmbiz_gif/e93fo6YQKNnQPNBENiaibicGGhM0k0lCo0WbO0SVNr241GvkK1OCQJdRy1M00hIuaHgEh0UxicmQb8yXC4XYrCKd3g/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)



每次更改输入值时，都会计算阶乘factorialOf(n)并将'factorialOf(n) called!'其记录到控制台。



另一方面，每次单击重新渲染按钮时，inc状态值都会更新。更新inc状态值会触发<CalculateFactorial />重新渲染。但是，作为次要效果，在重新渲染期间，阶乘会再次重新计算 -'factorialOf(n) called!'记录到控制台。





那么当组件重新渲染时，如何记住阶乘的计算呢，接下来该 useMemo() Hook 登场了。



通过使用useMemo(() => factorialOf(number), [number])而不是 simple factorialOf(number)，React 记住阶乘计算。

让我们改进<CalculateFactorial />并记住阶乘计算：

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
- 
- 
- 
- 
- 
- 
- 

```
import { useState, useMemo } from 'react';
export function CalculateFactorial() {  const [number, setNumber] = useState(1);  const [inc, setInc] = useState(0);
  const factorial = useMemo(() => factorialOf(number), [number]);
  const onChange = event => {    setNumber(Number(event.target.value));  };  const onClick = () => setInc(i => i + 1);    return (    <div>      Factorial of       <input type="number" value={number} onChange={onChange} />      is {factorial}      <button onClick={onClick}>Re-render</button>    </div>  );}
function factorialOf(n) {  console.log('factorialOf(n) called!');  return n <= 0 ? 1 : n * factorialOf(n - 1);}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

每次更改数字的值时，'factorialOf(n) called!'都会记录到控制台。这是预期的。

但是，如果您单击重新渲染按钮，'factorialOf(n) called!'则不会记录到控制台，因为useMemo(() => factorialOf(number), [number])返回记忆化的阶乘计算。



## **useMemo()与useCallback()**

------



useCallback()，与 相比useMemo()，是一个更专业的钩子，可以记住回调：

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
import { useCallback } from 'react';
function MyComponent({ prop }) {  const callback = () => {    return 'Result';  };  const memoizedCallback = useCallback(callback, [prop]);    return <ChildComponent callback={memoizedCallback} />;}
```

在上面的示例中，useCallback(() => {...}, [prop])只要prop依赖项相同，就返回相同的函数实例。

您可以使用相同的方式useMemo()来记忆回调：

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
import { useMemo } from 'react';
function MyComponent({ prop }) {  const callback = () => {    return 'Result';  };  const memoizedCallback = useMemo(() => callback, [prop]);    return <ChildComponent callback={memoizedCallback} />;}
```



**小心使用 useMemo()** 

------

虽然useMemo()可以提高组件的性能，但您必须确保使用和不使用挂钩来配置组件。只有在那之后才能得出是否值得记忆的结论。

当记忆使用不当时，可能会损害性能。



**结论**

------

useMemo(() => computation(a, b), [a, b])是让你记住昂贵计算的钩子。给定相同的[a, b]依赖关系，一旦记忆，钩子将返回记忆值而不调用computation(a, b)。



如果您想阅读有关Hook的信息，还可以查看 React.useCallBack() 使用指南。

- 

```
https://dmitripavlutin.com/dont-overuse-react-usecallback/
```