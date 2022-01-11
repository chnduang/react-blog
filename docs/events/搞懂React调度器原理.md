# 不用一行代码，搞懂React调度器原理

**Scheduler(调度器)**[1]是`React`重要的组成部分。

同时，他也是个独立的包，任何**「连续、可中断」**的流程都可以用`Scheduler`来调度，比如：

```
const work = {count: 100};

function doWork(work) {
  work.count--;
  console.log('do work!')
}
```

`work`满足两个条件：

1. 工作是连续的。一共需要执行100次，每次执行时调用`doWork`
2. 工作是可中断的。中断恢复后，接着中断前的`work.count`继续执行就行

满足这两个条件的工作都可以用`Scheduler`来调度。

调度后，`Scheduler`内部会生成对应`task`，并在正确的时机执行`task.callback`：

```
const task1 = {
  // 过期时间 等于 当前时间 + 优先级对应时间
  expirationTime: currentTime + priority,
  callback: doWork.bind(null, work)
}
```

本文会讲解`Scheduler`的实现原理。知道你不喜欢看大段的代码，所以本文没有一行代码。文末有`Scheduler`的源码地址，感兴趣的话可以去看看。

开整～

## 工作流程概览

`Scheduler`的工作原理如下图，接下来会详细解释：

![图片](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNDZDmWdkibOIygJN3RWUa6vcTmlf3K7q0Q3wricYuse3Eb5EJTpTkV7hX9UweyWDbkiaYeh9AYQEJcGA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在`Scheduler`中有两个容易混淆的概念：

1. delay

`delay`代表**「task需要延迟执行的时间」**。配置了`delay`的`task`会先进入`timerQueue`中。

当`delay`对应时间到期后，该`task`会转移到`taskQueue`中。

1. expirationTime

`expirationTime`代表**「task的过期时间」**。

不是所有`task`都会配置`delay`，没有配置`delay`的`task`会直接进入`taskQueue`。这就导致`taskQueue`中可能存在多个`task`。

如何决定哪个`task.callback`先执行呢？`Scheduler`根据`task.expirationTime`作为排序依据，值越小优先级越高。

如果`task.expirationTime`小于当前时间，不仅优先级最高，而且`task.callback`的执行不会被中断。

总结一下`task`的几种情况：

1. 配置`delay`且`delay`未到期：`task`一定不会执行
2. 配置`delay`且到期，或者未配置`delay`的`task`，同时`task.expirationTime`未到期：根据`task.expirationTime`排序后，按顺序执行
3. `task.expirationTime`到期的`task`：优先级最高，且同步、不可中断

## 工作流程详解

将流程概览图替换为`Scheduler`中具体方法后，如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNDZDmWdkibOIygJN3RWUa6vcWPzkLaUx1yLAlsYkkflGOXLwoyXjPWmib4m1MIicvft5FjMJQqmFrGFQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

完整工作流程如下：

1. 执行`Scheduler.scheduleCallback`生成`task`

根据**「是否传递delay参数」**，生成的`task`会进入`timerQueue`或`taskQueue`。

1. 当`timerQueue`中第一个`task`延迟的时间到期后，执行`advanceTimers`将**「到期的task」**从`timerQueue`中移到`taskQueue`中

其中，`timerQueue`、`taskQueue`的数据结构为`小顶堆`实现的`优先级队列`。

1. 接下来，执行`requestHostCallback`方法，他会在新的`宏任务`中执行`workLoop`方法

**「在宏任务中执行回调」**的方法很多，`Scheduler`在浏览器环境默认使用`MessageChannel`实现。

如果不支持`MessageChannel`，会降级到`setTimeout`。`Node`或`老版IE`下会使用`setImmediate`。

1. `workLoop`方法会循环消费`taskQueue`中的`task`（即执行`task.callback`），直到满足如下条件之一，中断循环：

- `taskQueue`中不存在`task`
- 时间切片用尽

1. 循环中断后，如果`taskQueue`不为空，则进入步骤3。如果`timerQueue`不为空，则进入步骤2

## 总结

总结一下，`Scheduler`的完整执行流程包括两个循环：

1. `taskQueue`的生产（从`timerQueue`中移入或执行`scheduleCallback`生成）到消费的过程（即图中灰色部分），这是个异步循环
2. `taskQueue`的具体消费过程（即`workLoop`方法的执行），这是个同步循环

如果你想了解**「React中如何使用Scheduler」**，可以参考[100行代码实现React核心调度功能](https://mp.weixin.qq.com/s?__biz=MzkzMjIxNTcyMA==&mid=2247489391&idx=1&sn=bf420bb9013f0093cd897b1865b62681&chksm=c25e79a8f529f0bea56db9adfb95f4b933982c96afbb9674eda6693e67d591c5b19ce41f0f37&token=1599882398&lang=zh_CN&scene=21#wechat_redirect)

### 参考资料

[1]Scheduler(调度器): https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js