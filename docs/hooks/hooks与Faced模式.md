## React hooks与Faced模式才是最佳实践?

> [https://mp.weixin.qq.com/s/SnHUoM7tAhnfXplg5snoog](https://mp.weixin.qq.com/s/SnHUoM7tAhnfXplg5snoog)

#### 写在开头

- 去年`CTO`一直跟我在宣扬`faced`模式，但是当时没有`get`到它的点
- 等我`get`到的时候，他已经不在我身边工作了，真是一个悲伤的故事

#### 阅读本文前需要先了解的知识点

- 什么是`react hooks` ?

- - Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性,例如:

```
   import React, { useState } from 'react';

function Example() {
  // 声明一个新的叫做 “count” 的 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

- 什么是`faced`模式（外观模式）？

- - 外观模式:提供一个统一的接口，用来访问子系统中的一群接口。外观模式定义了一个高层的接口，让子系统更容易使用。

- 什么是自定义`hooks`?

- - 自定义`hooks`它是一个函数，其名称以 “use” 开头，函数内部可以调用其他的 Hook,一个常见的自定义`hooks`如下：

```
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

> 这个`hook`的作用是：通过传入的`好友id`,调用其他的`hook`，来判断其是否在线。

#### 正式开始

- `faced`模式意在提供一个统一的接口，用来访问子系统中的一群接口

- 在我们精确的识别、划分了业务模块之后，很可能就会出现这种需求，需要通过`react hooks`提供更多的前端统一接口

- 例如在做`IM即时通讯`客户端的时候，我们可能会在客户端，需要在一个好友群组中判断是否能通过预览查看对方的朋友圈简介

- - 业务拆解：
  - 首先获取对方的uuid
  - 再通过客户端数据库查询是否为好友关系（岛屿）
  - 再通过api接口调用查询是否有对方的朋友圈查看权限
  - 如果存在权限则拉取数据展示简介，如果不存在则展示 `-`

#### 拆解业务后的下一步 - 封装自定义`hook`

- 通过对方的uuid在客户端数据库查询是否为好友关系，应该是一个`hook`，这是一个常见的需求
- 通过api调用是否有对方uuid的朋友圈查看权限以及简介，也应该是一个`hook`
- 最后我们需要封装一个大的`hook`，去组装这两个`hook`,我们先绘制一个业务流程图，并且拆解出几个自定义`hook`

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

> 这个时候问题来了，如果不封装`hook`,那么我们将要在组件使用的地方去调用这几个`hook`或者函数，然后组件内部通过一系列处理判断去完成这个业务逻辑判断，可是这个通过头像查看群组内对方朋友圈的情况不止一个地方会用到，那么此时就需要复用这个逻辑,这里就需要用到`faced`模式了

#### faced模式的使用

- 提供一个统一的接口，用来访问子系统中的一群接口

> 这个时候，我们应该提供一个`hook`，通过它去访问这几个`hook`,最后在业务中去复用这个逻辑

- 封装统一对外的`hook`.用来访问内部的多个`hook`

- faced模式对外业务使用场景：

- - 用户点击群组内其他人头像
  - 用户点击朋友圈评论区 - 朋友的头像
  - 用户通过名片点击
  - 未来其他的场景...具体业务场景如下图所示:

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

> 这样，你或许不仅明白了为什么React会造出`hooks`这个东西，还明白了什么是`faced`模式

- 通过`faced`模式和`react hooks`的结合，在业务系统开发中，可以极大的提升效率，并且可以加强复杂业务系统的健壮性，单一逻辑的`hook`跟单一逻辑的后端接口对应，复杂的业务由`faced`模式统一提供对外的接口以访问内部的子系统

