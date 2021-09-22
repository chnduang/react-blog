# React-Fiber架构浅析

> [https://mp.weixin.qq.com/s/UyuJEAPGSm8XKHXvNTdQyw](https://mp.weixin.qq.com/s/UyuJEAPGSm8XKHXvNTdQyw)

## 1.浏览器渲染 

为了更好的理解 React Fiber, 我们先简单了解下渲染器进程的内部工作原理。

> 参考资料:
>
> 1. **从内部了解现代浏览器(3)**[1]
> 2. **渲染树构建、布局及绘制**[2]

### 1.1 渲染帧

帧 (frame): 动画过程中，每一幅静止的画面叫做帧。

帧率 (frame per second): 即每秒钟播放的静止画面的数量。

帧时长 (frame running time): 每一幅静止的画面的停留时间。

丢帧 (dropped frame): 当某一帧时长高于平均帧时长。

- 一般来说浏览器刷新率在60Hz, 渲染一帧时长必须控制在16.67ms (1s / 60 = 16.67ms)。
- 如果渲染超过该时间, 对用户视觉上来说，会出现卡顿现象，即丢帧 (dropped frame)。

### 1.2 帧生命周期

![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqnSvBHOnuOIY0B4DttcgibPLCnOYCNw8fkibD2aEm2QKZfwDW9bF6ibM7ZT09FufiaD7nqL9DDQSlTzA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



图: 简单描述帧生命周期

```
简单描述一帧的生命周期:

1. 一帧开始。

2. 主线程:

- Event Handlers: UI交互输入的事件回调, 例如input、click、wheel等。

- RAF: 执行requestAnimationFrame回调。

- DOM Tree: 解析HTML, 构建DOM Tree, 当JS对DOM有变更会重新触发该流程。

- CSS Tree: 构建CSS Tree。至此构建出Render Tree。

- Layout: 所有元素的position、size信息。

- Paint: 像素填充, 例如颜色、文字、边框等可视部分。

- Composite: 绘制的指令信息传到合成线程中。

- RequestIdleCallback: 如果此时一帧还有空余时间, 则执行该回调。

3. 合成线程:

- Raster: 合成线程将信息分块, 并把每块发送给光栅线程, 光栅线程创建位图, 并通知GPU进程刷新这一帧。

4. 一帧结束。
```

### 1.3 丢帧实验

怎么就丢帧了呢?

对于流畅的动画，如果一帧处理时间超过16ms，就能感到页面的卡顿了。

> Demo: https://linjiayu6.github.io/FE-RequestIdleCallback-demo/

> Github: **RequestIdleCallback 实验**[3]

当用户点击任一按键 A，B，C，因为主线程执行Event Handlers任务，动画因为浏览器不能及时处理下一帧，导致动画出现卡顿的现象。

```
// 处理同步任务，并占用主线程

const bindClick = id =>

element(id).addEventListener('click', Work.onSyncUnit)

// 绑定click事件

bindClick('btnA')

bindClick('btnB')

bindClick('btnC')

var Work = {

// 有1万个任务

unit: 10000,

// 处理每个任务

onOneUnit: function () { for (var i = 0; i <= 500000; i++) {} },

// 同步处理: 一次处理完所有任务

onSyncUnit: function () {

let _u = 0

while (_u < Work.unit) {

Work.onOneUnit()

_u ++

}

}

}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)



### 1.4 解决丢帧

上述，我们发现 JS运算是占用渲染的时间的。

在连续动画中，要做高耗时的操作，如何保证帧平稳呢？

**解决丢帧思考如下**:

1. 在一帧空闲时处理, 利用 **RequestIdleCallback**[4] 处理任务。

> window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。

1. 对高耗时的任务，进行分步骤处理。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

1. Web worker 貌似也可以解决上述问题，这里不做扩展。
2. ...

这里我们利用 **RequestIdleCallback**[5] 做个实验咩。

> Demo: https://linjiayu6.github.io/FE-RequestIdleCallback-demo/

> Github: **RequestIdleCallback 实验**[6]

```
const bindClick = id =>

element(id).addEventListener('click', Work.onAsyncUnit)

// 绑定click事件

bindClick('btnA')

bindClick('btnB')

bindClick('btnC')

var Work = {

// 有1万个任务

unit: 10000,

// 处理每个任务

onOneUnit: function () { for (var i = 0; i <= 500000; i++) {} },

// 异步处理

onAsyncUnit: function () {

// 空闲时间 1ms

const FREE_TIME = 1

let _u = 0

function cb(deadline) {

// 当任务还没有被处理完 & 一帧还有的空闲时间 > 1ms

while (_u < Work.unit && deadline.timeRemaining() > FREE_TIME) {

Work.onOneUnit()

_u ++

}

// 任务干完, 执行回调

if (_u >= Work.unit) {

// 执行回调

return

}

// 任务没完成, 继续等空闲执行

window.requestIdleCallback(cb)

}

window.requestIdleCallback(cb)

}

}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)



requestIdleCallback 启发

将一个大任务分割成N个小任务，在每一帧有空余时间情况下，逐步去执行小任务。

## 2.React15 (-) 架构缺点

> **React: stack reconciler实现**[7]

> **React 算法之深度优先遍历**[8]

递归 Recursion: 利用 **调用栈**[9]，实现自己调用自己的方法。

最常见的就是 **Leetcode: 斐波拉契数列**[10] 、**Leetcode: 70. 爬楼梯**[11]。

### 2.1 概述原因

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

该情况，类似我们上述# 1.3丢帧实验。

### 2.2 流程和代码解析

> 可能需要你有点 深度优先遍历、递归、回溯思想、🌲 等数据结构的知识。

> 这里只做流程解析，代码也为阉割版，重点是理解思想哈。

某React节点如下:

```
  class A extends React.Component {

    ...



    render() {

      return (

        <div id="app">

          <h1></h1>

          <p><h2></h2></p>

          <h3></h3>

        </div>

      )

    }

 }
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

图 DFS + 递归遍历的路径

下面是 **ReactFiberWorkLoop.old.js**[12] 阉割版代码，为了简要说明该流程。

```
// 工作循环同步处理

function workLoopSync() {

  // 有任务

  while (workInProgress !== null) {

    performUnitOfWork(workInProgress);

  }

}



function performUnitOfWork(unitOfWork: Fiber): void {

  // 对该节点 开始工作: return workInProgress.child; 返回的是该节点的孩子

  let next = beginWork(...);



  if (next === null) {

    // 对某Node 完成工作: 回溯向上, 向上找到某节点的兄弟 sibling 或 直到向上为root代表, 遍历结束。

    completeUnitOfWork(unitOfWork);

  } else {

    // 从ta 孩子入手, 继续向下工作

    workInProgress = next;

  }

}



/**

 * siblingFiber: 兄弟节点

 * returnFiber: 父亲节点

 */

function completeUnitOfWork(unitOfWork: Fiber): void {

  let completedWork = unitOfWork;



  // 这里又是一个循环

  do {

    // 1. 判断任务是否完成, 完成就打个完成的标签, 没有完成就抛出异常



    // 2. 如果有兄弟节点, 那么接下来工作节点是该 xd

    if (completedWork.sibling !== null) {

      workInProgress = siblingFiber;

      return;

    }



    // 3. 否则, 返回父亲节点

    completedWork = completedWork.return;

    workInProgress = completedWork;

  } while (completedWork !== null);



  // 最后, 是root节点, 结束

  if (workInProgressRootExitStatus === RootIncomplete) {

    workInProgressRootExitStatus = RootCompleted;

  }

}
```

## 3.上述总结

**因果关系**

基于这些原因，React不得不重构整个框架。

```
1. React (15ver-) 对创建和更新节点的处理，是通过 递归 🌲。

2. 递归 ， 在未完成对整个🌲 的遍历前，是不会停止的。

3. 该 任务 一直占用浏览器主线程，导致无 响应优先级更高 的任务。

4. 故，浏览器渲染超过临界时间，从视觉上来看，卡死 🐶。
```

**主动思考**

```
为了快速响应，防止丢帧，解决思路:


1. 将 任务 分解成 N个小任务；

2. If 一帧里没有 优先级更高的任务，则执行自己。

   else 有其他 优先级高的事务, 优先执行其他。

     If 等一帧有 空闲 再执行自己。

     else 下一帧。
```

我们再回头看下这个图，问题即转换如下:

```
如何将任务拆分？

如何判断优先级？

如何判断一帧空闲时，再执行？

...
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

# Fiber 架构

> 推荐 👍 https://github.com/7kms/react-illustration-series/tree/v17.0.1

> 推荐 👍 https://react.iamkasong.com/preparation/oldConstructure.html

下面，不会有大段大段代码，去讲具体的实现。

而是，以因果逻辑，带你去了解 why，how，when (为什么、怎么做、何时做)。

## 4.抽象问题

上面我们说到了什么任务、优先级等等，我们通过图的方式，抽象下问题。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

```
描述:

1. 任务A进入执行区域。

2. 在执行任务A的过程中，更高优先级任务B，请求被执行。

3. 但因为先来后到嘛，此时任务B因为无法被执行，而暂时被挂起，只能等待执行。

4. 只有执行完任务A后，才会执行任务B。
```

**上述流程可类比:** 你在吃饭，突然你老板 给你打电话，你一定要坚持吃完饭，才接你老板的电话。

(脑补一下老板的表情😭)

很明显，这样处理问题，效率奇低无比。

按照我们在前情总结部分的诉求，将上述图变成这样是不是更合理些。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

```
描述:

1. 任务A进入执行区域。

2. 在执行任务A的过程中，更高优先级任务B，请求被执行。

3. 考虑到任务B优先级更高，则将任务A没有执行完成的部分，Stash暂存。

4. 任务B被执行。当任务B被执行完成后，去执行剩余没有完成的任务A。
```

**上述流程可类比:** 你在吃饭，突然你老板给你打电话，即使你没有吃完饭，也接起了你老板的电话，后继续吃饭。(脑补一下老板的表情😊)

## 5.核心关注

### 5.1 并发、调度

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

Concurrency & Scheduler

**Concurrency 并发:** 有能力优先处理更高优事务，同时对正在执行的中途任务可暂存，待高优完成后，再去执行。

> **concurrency** is the ability of different parts or units of a **program**[13], **algorithm**[14], or **problem**[15] to be [executed](https://en.wikipedia.org/wiki/Execution_(computing "executed")) out-of-order or at the same time simultaneously **partial order**[16], without affecting the final outcome.

> https://en.wikipedia.org/wiki/Concurrency_(computer_science)

**Scheduler 协调调度**: 暂存未执行任务，等待时机成熟后，再去安排执行剩下未完成任务。

考虑 所有任务可以被并发执行，就需要有个协调任务的调度算法。

看到这里，不知道你有没有发现一个大bug。

肯定是**Call Stack**[17]。

### 5.2 调用栈、虚拟调用栈帧

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

调用栈这里看起来就很不合理。

因为浏览器是利用调用栈来管理函数执行顺序的，秉承着先进后出原则，是如何做到某任务都入栈了，但是因为中途有其他事儿，就被中断。中断就不算了，还能中断后，接着后续再执行。

**问题突然间就变成: pause a functioin call (暂停对一个函数的调用)。**

巧了，像 generator 和 浏览器debugger 就可以做到中断函数调用。但考虑到可中断渲染，并可重回构造。React自行实现了一套体系叫做 **React fiber 架构。**

**React Fiber 核心: 自行实现 虚拟栈帧。**

> That's the purpose of React Fiber. Fiber is reimplementation of the stack, specialized for React components. You can think of a single fiber as a **virtual stack frame**.

> https://github.com/acdlite/react-fiber-architecture

看到这里，是不是觉得 React yyds。ps: 反正看不太懂的都是 yyds。

### 5.3 React 16 (+) 架构

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 6.数据结构

> **FiberNode.js**[18]

Fiber的数据结构有三层信息: 实例属性、构建属性、工作属性。

下面以该demo代码为例:

```
<div id="linjiayu">123</div>

<script type="text/babel">

    const App = () => {

        const [sum, onSetSum] = React.useState(0)



        return (

            <div id="app 1">

                <h1 id="2-1 h1">标题 h1</h1>

                <ul id="2-2 ul"> 

                    <li id="3-1 li" onClick={() => onSetSum(d => d + 1)}>点击 h2</li>

                    <li id="3-2 li">{sum}</li>

                </ul>



                <h3 id="2-3 h3">标题 h3</h3>

            </div>

        )

    }



    ReactDOM.render(

        <App />,

        document.getElementById('linjiayu')

    );

</script>
```

### 6.1 实例属性

该Fiber的基本信息，例如组件类型等。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 6.2 构建属性

构建属性 (return、child、sibling)，根据上面代码，我们构建一个Fiber树🌲。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

#### 构建流程

和 2.2 流程和代码解析 部分不同的是:

1. 分为同步或异步更新。
2. 且增加的异步更新 使用该字段 **shouldYield** 来判断是否需要中断。

```
// performSyncWorkOnRoot会调用该方法

function workLoopSync() {

  while (workInProgress !== null) {

    performUnitOfWork(workInProgress);

  }

}



// performConcurrentWorkOnRoot会调用该方法

function workLoopConcurrent() {

  while (workInProgress !== null && ! shouldYield ()) {

    performUnitOfWork(workInProgress);

  }

}
```

在一个递归循环里，递: **beginWork()**[19], 归 **completeWork()**[20]

> 虚线: 表达构建关系，但未完成状态。

> 实线: 已构建关系，并已执行某个状态。
>
> - 实线 child 和 sibling 已执行beginWork()
> - 实线 return 已执行 completeUnitOfWork()

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

```
1. 创建fiberNode FiberRootNode 

2. 创建fiberNode rootFiber (即示例中 <div id="linjiayu">)



进入循环工作区域, workInProgress(工作指针指向 rootFiber)

3. 创建fiberNode App 

   beginWork() -> 只有一个子节点 -> workInProgress(工作指针指向App) 

   

4. 创建fiberNode div 

   beginWork() -> 有多个子节点 -> workInProgress(工作指针指向div) 
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

```
5. 构建孩子们节点

按照5.1 -> 5.2 -> 5.3 顺序将每个节点创建。
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

```
6. workInProgress (工作指针指向h1)

   beginWork() -> 没有子节点 -> completeUnitOfWork() -> 有兄弟节点，继续 ...
```

### 6.3 工作属性

1. 【数据】数据的变更会导致UI层的变更。
2. 【协调】为了减少对DOM的直接操作，通过Reconcile进行diff查找，并将需要变更节点，打上标签，变更路径保留在effectList里。
3. 【调度】待变更内容要有Scheduler优先级处理。

故，涉及到diff等查找操作，是需要有个高效手段来处理前后变化，即双缓存机制。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

有关双缓存机制、数据更新、diff算法等，这里不做过多介绍。

## 7.Reconciler 和 Scheduler

上面，我们概述了fiberNode的数据结构，**链表结构即可支持随时随时中断的诉求**。

下面我们简述下架构中两个核心模块:

- Reconciler (协调): 负责找出变化的组件。
- Scheduler (调度): 负责找出高优任务。

### 7.1 Reconciler 运行流程浅析

1. **【输入】** 当数据初始化或变化，最后会调用`schedulerUpdateOnFiber`该方法。

- 不需要调度，直接去构造fiber树。
- 需要调度，注册调度任务。

```
// scheduleUpdateOnFiber(fiber, lane, eventTime) 以下为阉割版代码

// 同步

if (lane === SyncLane) {

    if ( 

       // Check if we're inside unbatchedUpdates (没有一次事件回调中触发多次更新)

      (executionContext & LegacyUnbatchedContext) !== NoContext && 

      // Check if we're not already rendering (是否尚未渲染)

      (executionContext & (RenderContext | CommitContext)) === NoContext) {

      // 不调度, 直接去构造fiber树

      performSyncWorkOnRoot(root);

   }

}



// 否则，需要调度交给Scheduler后，再去构造fiber树

ensureRootIsScheduled(root, eventTime);
```

1. **【注册任务】** `ensureRootIsScheduled`

两类任务:

- performSyncWorkOnRoot 同步构建tree。
- performConcurrentWorkOnRoot 异步构建tree。

scheduleSyncCallback 或 scheduleCallback: 将上述两类任务封装到了对应的**任务队列**中。

```
// ensureRootIsScheduled

function ensureRootIsScheduled(root, currentTime) {

    // ....

    

    // 1. 优先级最高，立刻马上要同步执行

    if (newCallbackPriority === SyncLanePriority) {

      newCallbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));

     // 2. 同步批量更新

    } else if (newCallbackPriority === SyncBatchedLanePriority) {

      newCallbackNode = scheduleCallback(ImmediatePriority$1, performSyncWorkOnRoot.bind(null, root));

    } else {

      // 3. 异步优先级登记

      var schedulerPriorityLevel = lanePriorityToSchedulerPriority(newCallbackPriority);

      newCallbackNode = scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));

    }

    

    // ...

    

    // 更新rootFiber 任务

    root.callbackNode = newCallbackNode;

}
```

同步任务会放到syncQueue 队列，会被立即被执行。

```
var _queue = syncQueue;



// 执行所有同步任务

runWithPriority(ImmediatePriority, () => {

    for (; i < queue.length; i++) {

    let callback = queue[i];

    do {

        callback = callback(isSync);

    } while (callback !== null);

    }

});

// 清空同步任务

syncQueue = null;
```

异步处理会调用 scheduler方法 `unstable_scheduleCallback`，其实是requestIdleCallback替代品，该方法传入回调任务，和过期时间，来安排任务的执行。

```
function unstable_scheduleCallback(callback, deprecated_options) {}
```

1. **【执行任务回调】**

下面 `performSyncWorkOnRoot` 和 `performConcurrentWorkOnRoot` 不同的是: 异步执行任务，可随时中断渲染 shouldYield()

同步执行构建树

```
function performSyncWorkOnRoot(root) {

  // 1. 构建树

  /*

    renderRootSync 会 调用该方法 workLoopSync

    while (workInProgress !== null) {

      performUnitOfWork(workInProgress);

    }

  */

  renderRootSync(root, lanes)

  

  // 2. 输出树 (可看下双缓存机制)

  finishedWork = root.current.alternate;

}
```

异步执行构建树

```
function performConcurrentWorkOnRoot(root) {

   // 1. 构建树

   /*

    renderRootConcurrent 会 调用该方法 workLoopConcurrent

    while (workInProgress !== null &&  !shouldYield() ) {

      performUnitOfWork(workInProgress);

    }

  */

   renderRootConcurrent(root, lanes);

   // 2. 输出树 (可看下双缓存机制)

   finishConcurrentRender(root, exitStatus, lanes);

   

   // 3. check 是否还有其他更新, 是否需要发起新调度

   ensureRootIsScheduled(root, now());

    if (root.callbackNode === originalCallbackNode) {

      // 当前执行的任务被中断，返回个新的，再次渲染。

      return performConcurrentWorkOnRoot.bind(null, root);

    }



    return null;

}
```

1. 【**输出**】

将变更内容，输出至界面。详细看 `commitRoot`方法的实现。这里不做扩展。

1. 小总结

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 7.2 Scheduler 运行流程浅析

> **workloop.js**[21]

上面我们说到了同步和异步的任务，异步任务是可以中断且需要Scheduler配合处理。

注意只有异步任务即开启了并发模式，才会有时间分片。

workLoop是 实现时间切片 和 可中断渲染的核心。也是我们上面说到的**虚拟栈帧**的能力 **。**

以下为了说明，简化流程:

```
// 并发任务的入口

function workLoopConcurrent() {

  // Perform work until Scheduler asks us to yield

  // 有任务 & 是否需要中断

  while (workInProgress !== null && !shouldYield() ) {

    performUnitOfWork(workInProgress);

  }

}

const scheduler = {

    // 任务放到队列里，等待空闲执行

    taskQueue: [

       {

          // 每个任务是个回调的概念, 且回调任务是可中断的

          callback: workLoopConcurrent

       }

    ],


    // 判断: 是否需要中断, 将控制权交给主进程

    shouldYieldToHost () {

        // 没有剩余时间

        if (currentTime >= deadline) {

            // 但需要渲染 和 有更高优任务

            if (needsPaint || scheduling.isInputPending()) {

                return true; // 中断

            }

            // 是否超过 300ms

            return currentTime >= maxYieldInterval;

        }


        // 还有剩余时间

        return false;

    },


    // 执行入口可见

    workLoop () {

        // 当前第一个任务

        currentTask = taskQueue[0];

 
        // 每次 currentTask 退出 就是一个时间切切片

        while(currentTask !== null) {

            // 任务没有过期, 但一帧已经无可用时间 或 需要被中断, 则让出主线程

            // 每一次执行均进行超时检测，做到让出主线程。

            if (currentTask.expirationTime > currentTime

 && (!hasTimeRemaining || shouldYieldToHost())) {

 break

 }

            // 执行任务

            const callback = currentTask.callback;

            const continuationCallback = callback(didUserCallbackTimeout);

            // 如果该任务后, 还有连续回调

            if (typeof continuationCallback === 'function') {

                // 则保留当前

                currentTask.callback = continuationCallback;

            } else  {

                // 将currentTask移除该队列

                pop(taskQueue);

            }


            // 更新currentTask

            currentTask = peek(taskQueue);

        }

    },

}
```

简而言之:

1. 有个任务队列 queue，该队列存放可中断的任务。

2. `workLoop`对队列里取第一个任务currentTask，进入循环开始执行。

3. - 如果任务执行完后，还有连续的回调，则 currentTask.callback = continuationCallback
   - 否则移除已完成的任务
   - 当该任务没有时间 或 需要中断 (渲染任务 或 其他高优任务插入等)，则让出主线程。
   - 否则执行任务 currentTask.callback()
   - 更新任务currentTask，继续循环走起。

这里还涉及更多细节，例如:

- requestAnimationFrame 计算一帧的空余时间；
- 使用new MessageChannel () 执行宏任务;
- 优先级;
- ...

这里不做详细说明。

## 8.小总结

- 我们想要实现**并发**诉求，就需要从底层重构，即**FiberNode**的实现。
- 调用栈call stack是无法做到并发 (异步可中断) 诉求，故React自行实现了一套**虚拟栈帧。**
- **虚拟栈帧** 是要具备**调度**能力的，也就是如何在适当的时候去执行任务。
- **scheduler** 可做到异步可中断，并可自主分配优先级高低的任务。

(即任务 (状态: 运行/中断/继续) **Lane**运行策略)

(实际上，scheduler + Lane 调度策略远比该处理复杂的多😭)

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

图: 前后对比 (个人理解, 错误请指正)

以上，同学们是不是对React Fiber架构有了初步的理解哦~

# 其他说明

### 双缓存机制

> 参考: **双缓存Fiber树**[22]

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)



至多有两棵 Fiber Tree。

分别叫做current fiber tree 和 workInProgress fiber tree。

即在屏幕上已建立的fiber tree 和 因为数据变化重新在内存里创建的fiber tree。

他们之间是通过 alternate属性(指针) 建立连接。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)



简单的说:

1. 就是workInProgress fiber的创建 **是否可复用** current fiber的节点。后续可再详看diff算法。
2. workInProgress fiber tree 将确定要变更节点，渲染到屏幕上。
3. workInProgress fiber tree 晋升为 current fiber tree。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)



### 参考资料

[1]从内部了解现代浏览器(3): *https://juejin.cn/post/6844903687383416840*[2]渲染树构建、布局及绘制: *https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction*[3]RequestIdleCallback 实验: *https://github.com/Linjiayu6/FE-RequestIdleCallback-demo*[4]RequestIdleCallback: *https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback*[5]RequestIdleCallback: *https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback*[6]RequestIdleCallback 实验: *https://github.com/Linjiayu6/FE-RequestIdleCallback-demo*[7]React: stack reconciler实现: *https://zh-hans.reactjs.org/docs/implementation-notes.html*[8]React 算法之深度优先遍历: *https://juejin.cn/post/6912280245055782920*[9]调用栈: *https://segmentfault.com/a/1190000010360316*[10]Leetcode: 斐波拉契数列: *https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/*[11]Leetcode: 70. 爬楼梯: *https://leetcode-cn.com/problems/climbing-stairs/*[12]ReactFiberWorkLoop.old.js: *https://github.com/facebook/react/blob/v17.0.1/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L1558*[13]program: *https://en.wikipedia.org/wiki/Computer_program*[14]algorithm: *https://en.wikipedia.org/wiki/Algorithm*[15]problem: *https://en.wikipedia.org/wiki/Problem_solving*[16]partial order: *https://en.wikipedia.org/wiki/Partial_Order*[17]Call Stack: *https://segmentfault.com/a/1190000021456103*[18]FiberNode.js: *https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117*[19]beginWork(): *https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3058*[20]completeWork(): *https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L652*[21]workloop.js: *https://github.com/facebook/react/blob/v17.0.1/packages/scheduler/src/Scheduler.js#L164*[22]双缓存Fiber树: *https://react.iamkasong.com/process/doubleBuffer.html#update%E6%97%B6*

