# React 事件系统原理

> [https://mp.weixin.qq.com/s/mkus1HCB1B6sQ4utb5i39w](https://mp.weixin.qq.com/s/mkus1HCB1B6sQ4utb5i39w)

> React 合成事件是 React **模拟原生 DOM 事件所有能力的一个对象**，它根据 W3C规范来定义合成事件，**兼容所有浏览器**，**拥有与浏览器原生事件相同的接口

[react官方描述](https://zh-hans.reactjs.org/docs/events.html)

`SyntheticEvent` 实例将被传递给你的事件处理函数，它是浏览器的原生事件的跨浏览器包装器。除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括 `stopPropagation()` 和 `preventDefault()`。

分别打印出合成事件对象e和原生对象`e.nativeEvent`![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVGFIxqh2H3ibKpTpfW2Bj6Z16SicFJiaHFGhdb93n8VLSyczvt1QLccZicg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## React 事件系统架构

![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAV3o0MetcVpE6lmBSh5D5CyicXFLia3tic4znwY3vcyf8VkpibiayO47qqb6Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 我们可以将react系统分成注册和执行两部分去理解：

### 一、注册：

```js
// 
function enqueuePutListener(inst, registrationName, listener, transaction) {
    ...
  1. 找到document
  var isDocumentFragment = containerInfo._node && containerInfo._node.nodeType === DOC_FRAGMENT_TYPE;
  2. 注册事件，将事件注册到document上
  var doc = isDocumentFragment ? containerInfo._node : containerInfo._ownerDocument;
  3. 存储事件,放入事务队列中
  listenTo(registrationName, doc);
}
```

**react事件系统内部对事件在不同浏览器上的执行做了兼容因此无需使用者考虑浏览器相关情况：**

```js
  listen: function listen(target, eventType, callback) {
    if (target.addEventListener) {
      将原生事件添加到target这个dom上,也就是上边传递的document上
      这就是只有document这个DOM节点上有原生事件的原因
      target.addEventListener(eventType, callback, false);
      ...
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      ...
    }
  }
```

### 二、执行：

#### 事件分发dispatchEvent（react合成事件的冒泡机制）

```js
function handleTopLevelImpl(bookKeeping) {
  1. 找到事件触发的DOM和React Component
  var nativeEventTarget = getEventTarget(bookKeeping.nativeEvent);
  var targetInst = ReactDOMComponentTree.getClosestInstanceFromNode(nativeEventTarget);

  2. 执行事件回调前,先由当前组件向上遍历它的所有父组件。
  得到ancestors这个数组，这个数组同时也是冒泡顺序。
  var ancestor = targetInst;
  do {
    bookKeeping.ancestors.push(ancestor);
    ancestor = ancestor && findParent(ancestor);
  } while (ancestor);

  这个顺序就是冒泡的顺序,并且我们发现不能通过stopPropagation来阻止'冒泡'。
  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    ReactEventListener._handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}
```

#### handleTopLevel 构造合成事件并执行（依赖EventPluginHub）

```js
1. 初始化时将eventPlugin注册到EventPluginHub中，不同plugin分别构造不同类型的合成事件
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    ...不同插件
  });
  
2. 将事件放入事件池：
   EventPluginHub.enqueueEvents(events);
3. 再处理队列中的事件,包括之前未处理完的：
   EventPluginHub.processEventQueue(false);
```

## 合成事件-原生事件混用demo

刚接触react的同学，往往在react事件使用时会与原生事件混合（这里并非指责这种混用行为，只是在混用阶段需要区分出react时间系统和js本身事件的执行差异），时常会有事件执行出现不符合预期的情况，这里我们用一个小demo来感受下二者执行的差异;

![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVq07sXgOQsEl4vt1J7qYGt1Xib0EH1FSqrQ0001HiceqOVkAU8k3pCGjQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVVYUvmm1fL6OiaMunKHXexTxzibyJniaLXPjNvwv7xTXHzEETZxoQTc2TA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

打印出执行结果：

![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVQtqvUNTmUbBwWWrWqAjAV10IkTibJiaunjfdO0cPyjz2FqIZUrKrqF1Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 由此我们可以了解到如下原生事件、react事件、document上挂载事件执行顺序：



## 合成事件存在意义

### 1.统一管理（document）

react事件集中在document上集中管理

### 2.不同浏览器兼容问题

### 3.减少事件创建销毁的性能损耗（避免频繁的垃圾回收机制）

react事件队列的存储和取出使用缓解了dom元素注册销毁所消耗的性能

### 4.利用合成事件的冒泡从document中触发的特性

## 合成事件中存在的问题

#### 1.原生事件和合成事件混用时原生事件对入react合成事件的影响

- 原生事件中禁止冒泡会阻止react合成事件的执行
- react合成事件禁止冒泡不会对原生生效

#### 2.事件池中中事件处理函数全部被调用之后，所有属性都会被置为 null

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)![图片](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVL0XZSFqxL0tZZBKmhHHWeic7wwV9ZndLQO0I27H7jrBrcoACEDXRuqQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

##### 避免方法：

- `e.persist()` //可以阻止事件池清掉取出事件
- 17版本react会有废弃事件池等更改，此现象也不会存在

#### 3.不同版本的 React 组件嵌套使用时，e.stopPropagation无法正常工作（两个不同版本的事件系统是独立的，都注册到document时的时间不相同）

