## 你可能没有关注过的 React 性能优化

> [https://mp.weixin.qq.com/s/P0Iir1rNw9iy1v11TeW6XQ](https://mp.weixin.qq.com/s/P0Iir1rNw9iy1v11TeW6XQ)

## **先说两句**

关于我今天想写的内容，大部分你其实都可以在`React`官方文档上学习到。那为什么我还是想写？因为作为一个写了差不多有三年的`React`的人，我居然没有正儿八经的通读过官方文档，我想告诉的可能是和我类似的人吧，同时也补充一些我自己的理解和看法。

## **问你几个问题**

性能优化这个问题啊，真的是永远都逃不了，是个面试官都要问几句，不过说实话不知道是`React`做的太好了，还是我做的项目都太基础了，基本没遇到过什么性能问题，导致我在很长一段时间内根本不知道 React 还有很多跟性能优化有关的 API。

先来看个代码，我直接在一个文件里定义多个组件方便大家观看，正式编写代码的时候一个文件就是一个组件。

```js
import React from 'react';

class Test extends React.Component {
  componentDidUpdate() {
    console.log('Test componentDidUpdate');
  }

  render() {
    return <div></div>;
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => ({
      count: state.count + 1,
    }));
  }

  handleTestClick() {}

  render() {
    return (
      <div>
        <div>{this.state.count}</div>
        <div onClick={this.handleClick}>click</div>
        <Test onClick={this.handleTestClick} />
      </div>
    );
  }
}
```

这代码没什么好说的，每次点击`click`更新`state`，我现在问几个问题，你先思考一下~

1. 每次点击`click`的时候，`Test`组件会打印`Test componentDidUpdate`吗？
2. 如果我把`Test`组件的`React.Component`替换为`React.PureComponent`，结果与上面一样吗？如果不一样，为什么？
3. 如果我修改这一行代码`<Test onClick={this.handleTestClick} />`为`<Test onClick={() => {}} />`结果又如何？

## **shouldComponentUpdate**

好像所有的内容都要从这个东西说起，`shouldComponentUpdate`作为`React`生命周期的一部分，大多数`React`开发者至少还是听说过它的，简单来说在这个函数中返回一个布尔值，`React`会根据这个布尔值来判断组件是否需要重新渲染。

`shouldComponentUpdate`接收两个参数，一个是更新后的`props`，一个是更新后的`state`，可以通过比较两个`props`和`state`来决定是否需要重新渲染组件。

```js
import React from 'react';

class Test extends React.Component {
  componentDidUpdate() {
    console.log('Test componentDidUpdate');
  }
    
  // 每次点击 click 都会打印 Test componentDidUpdate
  // 添加这个函数后当 count 没有变化时不会打印 Test componentDidUpdate
  shouldComponentUpdate(nextProps) {
    if (this.props.count === nextProps.count) {
      return false;
    }
    return true;
  }

  render() {
    return <div></div>;
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => ({
      count: state.count,
    }));
  }

  render() {
    return (
      <div>
        <div>{this.state.count}</div>
        <div onClick={this.handleClick}>click</div>
        <Test count={this.state.count} />
      </div>
    );
  }
}
```

这段代码也算比较直观的说明了`shouldComponentUpdate`的用法，为什么要这么做？当只有一个`Test`组件的时候可能影响不大，那如果有一千个乃至一万个`Test`的时候呢，每点击一次`click`就有一千个、一万个`Test`的`componentDidUpdate`被调用，这就有点夸张了。所以当你在使用循环渲染组件的时候就一定要注意到这一个点，它可能会成为你应用的瓶颈。

现在我们来解一下第一个问题，每次点击`click`的时候，`Test`组件会打印`Test componentDidUpdate`吗？

是的，每次点击`click`的时候，`Test`组件会打印`Test componentDidUpdate`，除非我们在`Test`中定义了`shouldComponentUpdate`，同时返回了`false`阻止其重新渲染。

## **PureComponent**

关于`React`的这个 API，相信大家也没有那么陌生，根据官方文档的说法`Component`和`PureComponent`很相似，两者的区别在于`PureComponent`中实现了`shouldComponentUpdate`函数，这也是为什么我说要从`shouldComponentUpdate`说起。

```js
import React from 'react';

class Test extends React.PureComponent {
  componentDidUpdate() {
    console.log('Test componentDidUpdate');
  }
    // 错误的用法
  shouldComponentUpdate(nextProps) {
    if (this.props.count === nextProps.count) {
      return false;
    }
    return true;
  }

  render() {
    return <div></div>;
  }
}
```

如果你在`PureComponent`中又使用了`shouldComponentUpdate`你应该会得到这样一个警告，侧面也告诉我们`PureComponent`已经实现了`shouldComponentUpdate`这个函数了。

Test has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.

官网文档中说`PureComponent`中以浅层对比`props`和`state`的方式来实现了这个函数，也就是浅比较，那什么又是浅比较呢？可以简单的理解为`a === b`，这里面还是有一些说头的，不过不在本文探讨范围内，举两个例子，大家可以自行搜索理解。

```
let a = 5;
let b = 5;
let c = {};
let d = {};
console.log(a === b); // true
console.log(c === d); // false
```

在来看一段因为不当的代码导致的问题，大家一定要注意这部分的内容。

```js
import React from 'react';

class Test extends React.PureComponent {
  // 根据从 App 中传来的 animal 渲染组件
  // 在 App 中每次点击添加新的动物后, 这里还是原来的 dog
  render() {
    return <div>Test: {this.props.animal.join(',')}</div>;
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // 默认为一只狗
    this.state = { animal: ['dog'] };
    this.handleClick = this.handleClick.bind(this);
  }

  // 每次点击把新的值添加进 animal 中
  // 此处有一个 Bug, 由于 animal.push 方法虽然更新了原来的数组
  // 但是他们还是一个数组(这个说法有些奇怪), 指针还是一样的
  // 可能需要读者自行搜索理解 JS 中基本类型和引用类型的存储方式
  // 所以当 Test 组件接收到新的 animal 时, 通过浅比较会发现它们其实是一样的
  // 也就意味着 Test 不会重新渲染
  handleClick(val) {
    const { animal } = this.state;
    animal.push(val)

    this.setState({
      animal,
    });
  }

  // 根据 state 中的 animal 渲染组件
  render() {
    return (
      <div>
        <div>App: {this.state.animal.join(',')}</div>
        <div onClick={() => this.handleClick('cat')}>click</div>
        <Test animal={this.state.animal} />
      </div>
    );
  }
}
```

看到这里相信你应该能解答第二个问题和第三个问题了，不过我们还是一起再来看看~

问：如果我把`Test`组件的`React.Component`替换为`React.PureComponent`，结果与上面一样吗？如果不一样，为什么？

答：因为每次传递`props`中的`onClick`都是`App`组件中的`handleTestClick`，同时使用了`PureComponent`，所以每次浅比较都是一致的，所以不会在打印`Test componentDidUpdate`了。

问：如果我修改这一行代码`<Test onClick={this.handleTestClick} />`为`<Test onClick={() => {}} />`结果又如何？

答：虽然使用了`PureComponent`，但是由于`App`每次调用`render`函数的时候都会重新声明一个方法，此方法和上一次传递给`Test`的方法不同，所以每次点击还是会打印`Test componentDidUpdate`。

## **剩点内容补充**

除了上述两个 API 以外，其他 API 或多或少只是它们的改版，所以我就放在一起说了。

### **memo**

`React.memo`在我看来就是`PureComponent`无状态组件版本，如果用的是`class`就用`PureComponent`，如果用的是无状态组件就用`memo`。

```js
import React from 'react';

export default React.memo(function Test() {
  return <div>Test Component</div>;
});

// 它也可以接收第二个参数, 类似 shouldComponentUpdate
// 两个参数上次的props, 和当前的props
// 不传默认情况它们两个做浅比较, 传了由你自己控制
```

**注意：**此方法返回值与`shouldComponentUpdate`相反，返回值为`true`时不重新渲染组件。

### **useCallback 和 useMemo**

这两个 API 是`React Hook`的一部分，为什么要放在一起说呢？因为它们非常的类似，据官方文档`useCallback(fn, deps)`相当于`useMemo(() => fn, deps)`。

因为`React Hook`，我现在基本很少写`class`组件了，原因是什么相信用过的小伙伴都清楚，本文不阐述这方面的内容，只想再问你一个问题：`handleClick`方法每次都会重新定义吗？

```js
import React from 'react';

export default function Test() {
  const handleClick = () => console.log('click');
  return <div onClick={handleClick}>Test</div>
}
```

答案是会的，不信你可以验证一下。

```js
import React, { useState } from 'react';

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set
let set = new Set();

export default function App() {
  const [val, setVal] = useState(0);
  
  // 对比两种方式可以看出区别
  // const handleClick = useCallback(() => console.log('click'), []);
  const handleClick = () => console.log('click');
    
  // set 存的唯一值, 每次都会添加一个新值
  set.add(handleClick);
  console.log(set.size);

  return (
    <div>
      {/* 如果 Test 是个特别复杂的组件, handleClick 每次变化都会导致它重新渲染 */}
      <Test onClick={handleClick}>Test</Test>
      <div onClick={() => setVal(val + 1)}>click</div>
    </div>
  );
}
```

用法和说明其实从上述的样例可以看出，就不在额外的说明了。有时候我们除了函数需要缓存以外，一个值可能也需要，这时候就需要使用`useMemo`，它们两的区别也在于此，直接看用法。

```js
import React, { useState, useMemo } from 'react';

let set = new Set();

export default function App() {
  const [val, setVal] = useState(0);
    
  // 对比三种方式可以看出区别
  // const obj = useMemo(() => ({ label: 'Test', value: 'test' }),[]);
  // const obj = 'obj';
  const obj = { label: 'Test', value: 'test' };

  set.add(obj);
  console.log(set.size);

  return (
    <div>
      {/* 如果 Test 是个特别复杂的组件, obj 每次变化都会导致它重新渲染 */}
      <Test obj={obj}>Test</Test>
      <div onClick={() => setVal(val + 1)}>click</div>
    </div>
  );
}
```

这里面又涉及到一个`JavaScript`中基本类型和引用类型的区别，与上面浅比较类似，你可以试试当`obj`等于一个基本类型时候的效果。

### **Profiler**

最后的最后我们来说一下`Profiler`，它是用来测量被其包裹的 DOM 树渲染所带来的开销，帮助你排查性能瓶颈，直接看用法。

```js
import React, { Profiler, useState } from 'react';

function Test() {
  return <div>Test</div>;
}

const callback = (
  id, // 发生提交的 Profiler 树的 “id”
  phase, // "mount" （如果组件树刚加载） 或者 "update" （如果它重渲染了）之一
  actualDuration, // 本次更新 committed 花费的渲染时间
  baseDuration, // 估计不使用 memoization 的情况下渲染整颗子树需要的时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions // 属于本次更新的 interactions 的集合
) => {
  console.log(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  );
};

export default function App() {
  const [val, setVal] = useState(0);
  return (
    <div>
      <Profiler id="test" onRender={callback}>
        <Test>Test</Test>
      </Profiler>
      <div onClick={() => setVal(val + 1)}>click</div>
    </div>
  );
}
```

## **最后的最后** 

我所知道的`React`跟性能优化相关的 API 都在上面了，说实话我们遇到需要性能优化的场景真的太少了，这也是为什么面试官挑人的时候总喜欢问这方面的问题，因为大多数人都没有关注过，我们想要的也是那一小部分人。所以，多学点知识真的对自己很好，理解更多的内容，你才能更好的理解别人的代码。