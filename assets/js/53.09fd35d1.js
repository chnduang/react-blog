(window.webpackJsonp=window.webpackJsonp||[]).push([[53],{345:function(e,n,t){"use strict";t.r(n);var o=t(4),v=Object(o.a)({},(function(){var e=this,n=e._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("h2",{attrs:{id:"react-代码共享最佳实践方式"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#react-代码共享最佳实践方式"}},[e._v("#")]),e._v(" React 代码共享最佳实践方式")]),e._v(" "),n("blockquote",[n("p",[n("a",{attrs:{href:"https://mp.weixin.qq.com/s/xhiMjirgUhfO9dVqY5M9tQ",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://mp.weixin.qq.com/s/xhiMjirgUhfO9dVqY5M9tQ"),n("OutboundLink")],1)])]),e._v(" "),n("p",[e._v("任何一个项目发展到一定复杂性的时候，必然会面临逻辑复用的问题。在"),n("code",[e._v("React")]),e._v("中实现逻辑复用通常有以下几种方式："),n("code",[e._v("Mixin")]),e._v("、"),n("code",[e._v("高阶组件(HOC)")]),e._v("、"),n("code",[e._v("修饰器(decorator)")]),e._v("、"),n("code",[e._v("Render Props")]),e._v("、"),n("code",[e._v("Hook")]),e._v("。本文主要就以上几种方式的优缺点作分析，帮助开发者针对业务场景作出更适合的方式。")]),e._v(" "),n("h2",{attrs:{id:"mixin"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#mixin"}},[e._v("#")]),e._v(" "),n("strong",[e._v("Mixin")]),e._v("**—**")]),e._v(" "),n("p",[e._v("这或许是刚从"),n("code",[e._v("Vue")]),e._v("转向"),n("code",[e._v("React")]),e._v("的开发者第一个能够想到的方法。"),n("code",[e._v("Mixin")]),e._v("一直被广泛用于各种面向对象的语言中，"),n("strong",[e._v("其作用是为单继承语言创造一种类似多重继承的效果")]),e._v("。虽然现在"),n("code",[e._v("React")]),e._v("已将其放弃中，但"),n("code",[e._v("Mixin")]),e._v("的确曾是"),n("code",[e._v("React")]),e._v("实现代码共享的一种设计模式。")]),e._v(" "),n("p",[e._v("广义的 mixin 方法，就是用赋值的方式将 mixin 对象中的方法都挂载到原对象上，来实现对象的混入，类似 ES6 中的 Object.assign()的作用。原理如下：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("const mixin = function (obj, mixins) {\n  const newObj = obj\n  newObj.prototype = Object.create(obj.prototype)\n\n  for (let prop in mixins) {\n    // 遍历mixins的属性\n    if (mixins.hasOwnPrototype(prop)) {\n      // 判断是否为mixin的自身属性\n      newObj.prototype[prop] = mixins[prop]; // 赋值\n    }\n  }\n  return newObj\n};\n")])])]),n("h3",{attrs:{id:"在-react-中使用-mixin"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#在-react-中使用-mixin"}},[e._v("#")]),e._v(" 在 React 中使用 Mixin")]),e._v(" "),n("p",[e._v("假设在我们的项目中，多个组件都需要设置默认的"),n("code",[e._v("name")]),e._v("属性，使用"),n("code",[e._v("mixin")]),e._v("可以使我们不必在不同的组件里写多个同样的"),n("code",[e._v("getDefaultProps")]),e._v("方法，我们可以定义一个"),n("code",[e._v("mixin")]),e._v("：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('const DefaultNameMixin = {\n  getDefaultProps: function () {\n    return {\n      name: "Joy"\n    }\n  }\n}\n')])])]),n("p",[e._v("为了使用"),n("code",[e._v("mixin")]),e._v("，需要在组件中加入"),n("code",[e._v("mixins")]),e._v("属性，然后把我们写好的"),n("code",[e._v("mixin")]),e._v("包裹成一个数组，将它作为"),n("code",[e._v("mixins")]),e._v("的属性值：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("const ComponentOne = React.createClass({\n  mixins: [DefaultNameMixin]\n  render: function () {\n    return <h2>Hello {this.props.name}</h2>\n  }\n})\n")])])]),n("p",[n("strong",[e._v("写好的"),n("code",[e._v("mixin")]),e._v("可以在其他组件里重复使用。")])]),e._v(" "),n("p",[e._v("由于"),n("code",[e._v("mixins")]),e._v("属性值是一个数组，意味着我们"),n("strong",[e._v("可以同一个组件里调用多个"),n("code",[e._v("mixin")])]),e._v("。在上述例子中稍作更改得到：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('const DefaultFriendMixin = {\n  getDefaultProps: function () {\n    return {\n      friend: "Yummy"\n    }\n  }\n}\n\nconst ComponentOne = React.createClass({\n  mixins: [DefaultNameMixin, DefaultFriendMixin]\n  render: function () {\n    return (\n      <div>\n        <h2>Hello {this.props.name}</h2>\n        <h2>This is my friend {this.props.friend}</h2>\n      </div>\n    )\n  }\n})\n')])])]),n("p",[n("strong",[e._v("我们甚至可以在一个"),n("code",[e._v("mixin")]),e._v("里包含其他的"),n("code",[e._v("mixin")])]),e._v("。")]),e._v(" "),n("p",[e._v("比如写一个新的"),n("code",[e._v("mixin``DefaultProps")]),e._v("包含以上的"),n("code",[e._v("DefaultNameMixin")]),e._v("和"),n("code",[e._v("DefaultFriendMixin")]),e._v("：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("const DefaultPropsMixin = {\n  mixins: [DefaultNameMixin, DefaultFriendMixin]\n}\n\nconst ComponentOne = React.createClass({\n  mixins: [DefaultPropsMixin]\n  render: function () {\n    return (\n      <div>\n        <h2>Hello {this.props.name}</h2>\n        <h2>This is my friend {this.props.friend}</h2>\n      </div>\n    )\n  }\n})\n")])])]),n("p",[e._v("至此，我们可以总结出"),n("code",[e._v("mixin")]),e._v("至少拥有以下优势:")]),e._v(" "),n("ul",[n("li",[n("strong",[e._v("可以在多个组件里使用相同的"),n("code",[e._v("mixin")])]),e._v("；")]),e._v(" "),n("li",[n("strong",[e._v("可以在同一个组件里使用多个"),n("code",[e._v("mixin")])]),e._v("；")]),e._v(" "),n("li",[n("strong",[e._v("可以在同一个"),n("code",[e._v("mixin")]),e._v("里嵌套多个"),n("code",[e._v("mixin")])]),e._v("；")])]),e._v(" "),n("p",[e._v("但是在不同场景下，优势也可能变成劣势：")]),e._v(" "),n("ul",[n("li",[n("strong",[e._v("破坏原有组件的封装，可能需要去维护新的"),n("code",[e._v("state")]),e._v("和"),n("code",[e._v("props")]),e._v("等状态")]),e._v("；")]),e._v(" "),n("li",[n("strong",[e._v("不同"),n("code",[e._v("mixin")]),e._v("里的命名不可知，非常容易发生冲突")]),e._v("；")]),e._v(" "),n("li",[n("strong",[e._v("可能产生递归调用问题，增加了项目复杂性和维护难度")]),e._v("；")])]),e._v(" "),n("p",[e._v("除此之外，"),n("code",[e._v("mixin")]),e._v("在状态冲突、方法冲突、多个生命周期方法的调用顺序等问题拥有自己的处理逻辑。感兴趣的同学可以参考一下以下文章：")]),e._v(" "),n("ul",[n("li",[n("strong",[e._v("React Mixin 的使用")]),e._v("[1]")]),e._v(" "),n("li",[n("strong",[e._v("Mixins Considered Harmful")]),e._v("[2]")])]),e._v(" "),n("h2",{attrs:{id:"高阶组件"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#高阶组件"}},[e._v("#")]),e._v(" "),n("strong",[e._v("高阶组件")]),e._v("**—**")]),e._v(" "),n("p",[e._v("由于"),n("code",[e._v("mixin")]),e._v("存在上述缺陷，故"),n("code",[e._v("React")]),e._v("剥离了"),n("code",[e._v("mixin")]),e._v("，改用"),n("code",[e._v("高阶组件")]),e._v("来取代它。")]),e._v(" "),n("p",[n("strong",[n("code",[e._v("高阶组件")]),e._v("本质上是一个函数，它接受一个组件作为参数，返回一个新的组件")]),e._v("。")]),e._v(" "),n("p",[n("code",[e._v("React")]),e._v("官方在实现一些公共组件时，也用到了"),n("code",[e._v("高阶组件")]),e._v("，比如"),n("code",[e._v("react-router")]),e._v("中的"),n("code",[e._v("withRouter")]),e._v("，以及"),n("code",[e._v("Redux")]),e._v("中的"),n("code",[e._v("connect")]),e._v("。在这以"),n("code",[e._v("withRouter")]),e._v("为例。")]),e._v(" "),n("p",[e._v("默认情况下，必须是经过"),n("code",[e._v("Route")]),e._v("路由匹配渲染的组件才存在"),n("code",[e._v("this.props")]),e._v("、才拥有"),n("code",[e._v("路由参数")]),e._v("、才能使用"),n("code",[e._v("函数式导航")]),e._v("的写法执行"),n("code",[e._v("this.props.history.push('/next')")]),e._v("跳转到对应路由的页面。"),n("code",[e._v("高阶组件")]),e._v("中的"),n("code",[e._v("withRouter")]),e._v("作用是将一个没有被"),n("code",[e._v("Route")]),e._v("路由包裹的组件，包裹到"),n("code",[e._v("Route")]),e._v("里面，从而将"),n("code",[e._v("react-router")]),e._v("的三个对象"),n("code",[e._v("history")]),e._v("、"),n("code",[e._v("location")]),e._v("、"),n("code",[e._v("match")]),e._v("放入到该组件的"),n("code",[e._v("props")]),e._v("属性里，因此能实现"),n("code",[e._v("函数式导航跳转")]),e._v("。")]),e._v(" "),n("p",[n("code",[e._v("withRouter")]),e._v("的实现原理：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("const withRouter = (Component) => {\n  const displayName = `withRouter(${Component.displayName || Component.name})`\n  const C = props => {\n    const { wrappedComponentRef, ...remainingProps } = props\n    return (\n      <RouterContext.Consumer>\n        {context => {\n          invariant(\n            context,\n            `You should not use <${displayName} /> outside a <Router>`\n          );\n          return (\n            <Component\n              {...remainingProps}\n              {...context}\n              ref={wrappedComponentRef}\n            />\n          )\n        }}\n      </RouterContext.Consumer>\n    )\n}\n")])])]),n("p",[e._v("使用代码：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import React, { Component } from "react"\nimport { withRouter } from "react-router"\nclass TopHeader extends Component {\n  render() {\n    return (\n      <div>\n        导航栏\n        {/* 点击跳转login */}\n        <button onClick={this.exit}>退出</button>\n      </div>\n    )\n  }\n\n  exit = () => {\n    // 经过withRouter高阶函数包裹，就可以使用this.props进行跳转操作\n    this.props.history.push("/login")\n  }\n}\n// 使用withRouter包裹组件，返回history,location等\nexport default withRouter(TopHeader)\n')])])]),n("p",[e._v("由于"),n("code",[e._v("高阶组件")]),e._v("的本质是"),n("code",[e._v("获取组件并且返回新组件的方法")]),e._v("，所以理论上它也可以像"),n("code",[e._v("mixin")]),e._v("一样实现多重嵌套。")]),e._v(" "),n("p",[e._v("例如：")]),e._v(" "),n("p",[e._v("写一个赋能唱歌的高阶函数")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("import React, { Component } from 'react'\n\nconst widthSinging = WrappedComponent => {\n return class HOC extends Component {\n  constructor () {\n   super(...arguments)\n   this.singing = this.singing.bind(this)\n  }\n\n  singing = () => {\n   console.log('i am singing!')\n  }\n\n  render() {\n   return <WrappedComponent />\n  }\n }\n}\n")])])]),n("p",[e._v("写一个赋能跳舞的高阶函数")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("import React, { Component } from 'react'\n\nconst widthDancing = WrappedComponent => {\n return class HOC extends Component {\n  constructor () {\n   super(...arguments)\n   this.dancing = this.dancing.bind(this)\n  }\n\n  dancing = () => {\n   console.log('i am dancing!')\n  }\n\n  render() {\n   return <WrappedComponent />\n  }\n }\n}\n")])])]),n("p",[e._v("使用以上高阶组件")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import React, { Component } from "react"\nimport { widthSing, widthDancing } from "hocs"\n\nclass Joy extends Component {\n  render() {\n    return <div>Joy</div>\n  }\n}\n\n// 给Joy赋能唱歌和跳舞的特长\nexport default widthSinging(withDancing(Joy))\n')])])]),n("p",[e._v("由上可见，只需使用高阶函数进行简单的包裹，就可以把原本单纯的 Joy 变成一个既能唱歌又能跳舞的夜店小王子了！")]),e._v(" "),n("h3",{attrs:{id:"使用-hoc-的约定"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#使用-hoc-的约定"}},[e._v("#")]),e._v(" 使用 HOC 的约定")]),e._v(" "),n("p",[e._v("在使用"),n("code",[e._v("HOC")]),e._v("的时候，有一些墨守成规的约定：")]),e._v(" "),n("ul",[n("li",[e._v("将不相关的 Props 传递给包装组件（传递与其具体内容无关的 props）；")]),e._v(" "),n("li",[e._v("分步组合（避免不同形式的 HOC 串联调用）；")]),e._v(" "),n("li",[e._v("包含显示的 displayName 方便调试（每个 HOC 都应该符合规则的显示名称）；")]),e._v(" "),n("li",[e._v("不要在"),n("code",[e._v("render")]),e._v("函数中使用高阶组件（每次 render，高阶都返回新组件，影响 diff 性能）；")]),e._v(" "),n("li",[e._v("静态方法必须被拷贝（经过高阶返回的新组件，并不会包含原始组件的静态方法）；")]),e._v(" "),n("li",[e._v("避免使用 ref（ref 不会被传递）;")])]),e._v(" "),n("h3",{attrs:{id:"hoc-的优缺点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#hoc-的优缺点"}},[e._v("#")]),e._v(" HOC 的优缺点")]),e._v(" "),n("p",[e._v("至此我们可以总结一下"),n("code",[e._v("高阶组件(HOC)")]),e._v("的优点：")]),e._v(" "),n("ul",[n("li",[n("code",[e._v("HOC")]),e._v("是一个纯函数，便于使用和维护；")]),e._v(" "),n("li",[e._v("同样由于"),n("code",[e._v("HOC")]),e._v("是一个纯函数，支持传入多个参数，增强其适用范围；")]),e._v(" "),n("li",[n("code",[e._v("HOC")]),e._v("返回的是一个组件，可组合嵌套，灵活性强；")])]),e._v(" "),n("p",[e._v("当然"),n("code",[e._v("HOC")]),e._v("也会存在一些问题：")]),e._v(" "),n("ul",[n("li",[e._v("当多个"),n("code",[e._v("HOC")]),e._v("嵌套使用时，无法直接判断子组件的"),n("code",[e._v("props")]),e._v("是从哪个"),n("code",[e._v("HOC")]),e._v("负责传递的；")]),e._v(" "),n("li",[e._v("当父子组件有同名"),n("code",[e._v("props")]),e._v("，会导致父组件覆盖子组件同名"),n("code",[e._v("props")]),e._v("的问题，且"),n("code",[e._v("react")]),e._v("不会报错，开发者感知性低；")]),e._v(" "),n("li",[e._v("每一个"),n("code",[e._v("HOC")]),e._v("都返回一个新组件，从而产生了很多无用组件，同时加深了组件层级，不便于排查问题；")])]),e._v(" "),n("p",[n("code",[e._v("修饰器")]),e._v("和"),n("code",[e._v("高阶组件")]),e._v("属于同一模式，在此不展开讨论。")]),e._v(" "),n("h2",{attrs:{id:"render-props"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#render-props"}},[e._v("#")]),e._v(" "),n("strong",[e._v("Render Props")]),e._v("**—**")]),e._v(" "),n("p",[n("strong",[n("code",[e._v("Render Props")]),e._v("是一种非常灵活复用性非常高的模式，它可以把特定行为或功能封装成一个组件，提供给其他组件使用让其他组件拥有这样的能力")]),e._v("。")]),e._v(" "),n("blockquote",[n("p",[e._v("The term “render prop” refers to a technique for sharing code between React components using a prop whose value is a function.")])]),e._v(" "),n("p",[e._v("这是"),n("code",[e._v("React")]),e._v("官方对于"),n("code",[e._v("Render Props")]),e._v("的定义，翻译成大白话即：“"),n("code",[e._v("Render Props")]),e._v("是实现"),n("code",[e._v("React Components")]),e._v("之间代码共享的一种技术，组件的"),n("code",[e._v("props")]),e._v("里边包含有一个"),n("code",[e._v("function")]),e._v("类型的属性，组件可以调用该"),n("code",[e._v("props")]),e._v("属性来实现组件内部渲染逻辑”。")]),e._v(" "),n("p",[e._v("官方示例：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("<DataProvider render={(data) => <h1>Hello {data.target}</h1>} />\n")])])]),n("p",[e._v("如上，"),n("code",[e._v("DataProvider")]),e._v("组件拥有一个叫做"),n("code",[e._v("render")]),e._v("（也可以叫做其他名字）的"),n("code",[e._v("props")]),e._v("属性，该属性是一个函数，并且这个函数返回了一个"),n("code",[e._v("React Element")]),e._v("，在组件内部通过调用该函数来完成渲染，那么这个组件就用到了"),n("code",[e._v("render props")]),e._v("技术。")]),e._v(" "),n("p",[e._v("读者或许会疑惑，“我们为什么需要调用"),n("code",[e._v("props")]),e._v("属性来实现组件内部渲染，而不直接在组件内完成渲染”？借用"),n("code",[e._v("React")]),e._v("官方的答复，"),n("code",[e._v("render props")]),e._v("并非每个"),n("code",[e._v("React")]),e._v("开发者需要去掌握的技能，甚至你或许永远都不会用到这个方法，但它的存在的确为开发者在思考组件代码共享的问题时，提供了多一种选择。")]),e._v(" "),n("h3",{attrs:{id:"render-props使用场景"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#render-props使用场景"}},[e._v("#")]),e._v(" "),n("code",[e._v("Render Props")]),e._v("使用场景")]),e._v(" "),n("p",[e._v("我们在项目开发中可能需要频繁的用到弹窗，弹窗 UI 可以千变万化，但是功能却是类似的，即"),n("code",[e._v("打开")]),e._v("和"),n("code",[e._v("关闭")]),e._v("。以"),n("code",[e._v("antd")]),e._v("为例：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import { Modal, Button } from "antd"\nclass App extends React.Component {\n  state = { visible: false }\n\n  // 控制弹窗显示隐藏\n  toggleModal = (visible) => {\n    this.setState({ visible })\n  };\n\n  handleOk = (e) => {\n    // 做点什么\n    this.setState({ visible: false })\n  }\n\n  render() {\n    const { visible } = this.state\n    return (\n      <div>\n        <Button onClick={this.toggleModal.bind(this, true)}>Open</Button>\n        <Modal\n          title="Basic Modal"\n          visible={visible}\n          onOk={this.handleOk}\n          onCancel={this.toggleModal.bind(this, false)}\n        >\n          <p>Some contents...</p>\n        </Modal>\n      </div>\n    )\n  }\n}\n')])])]),n("p",[e._v("以上是最简单的"),n("code",[e._v("Model")]),e._v("使用实例，即便是简单的使用，我们仍需要关注它的显示状态，实现它的切换方法。但是开发者其实只想关注与业务逻辑相关的"),n("code",[e._v("onOk")]),e._v("，理想的使用方式应该是这样的：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('<MyModal>\n  <Button>Open</Button>\n  <Modal title="Basic Modal" onOk={this.handleOk}>\n    <p>Some contents...</p>\n  </Modal>\n</MyModal>\n')])])]),n("p",[e._v("可以通过"),n("code",[e._v("render props")]),e._v("实现以上使用方式：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import { Modal, Button } from "antd"\nclass MyModal extends React.Component {\n  state = { on: false }\n\n  toggle = () => {\n    this.setState({\n      on: !this.state.on\n    })\n  }\n\n  renderButton = (props) => <Button {...props} onClick={this.toggle} />\n\n  renderModal = ({ onOK, ...rest }) => (\n    <Modal\n      {...rest}\n      visible={this.state.on}\n      onOk={() => {\n        onOK && onOK()\n        this.toggle()\n      }}\n      onCancel={this.toggle}\n    />\n  )\n\n  render() {\n    return this.props.children({\n      Button: this.renderButton,\n      Modal: this.renderModal\n    })\n  }\n}\n')])])]),n("p",[e._v("这样我们就完成了一个具备状态和基础功能的"),n("code",[e._v("Modal")]),e._v("，我们在其他页面使用该"),n("code",[e._v("Modal")]),e._v("时，只需要关注特定的业务逻辑即可。")]),e._v(" "),n("p",[e._v("以上可以看出，"),n("code",[e._v("render props")]),e._v("是一个真正的"),n("code",[e._v("React")]),e._v("组件，而不是像"),n("code",[e._v("HOC")]),e._v("一样只是一个"),n("strong",[e._v("可以返回组件的函数")]),e._v("，这也意味着使用"),n("code",[e._v("render props")]),e._v("不会像"),n("code",[e._v("HOC")]),e._v("一样产生组件层级嵌套的问题，也不用担心"),n("code",[e._v("props")]),e._v("命名冲突产生的覆盖问题。")]),e._v(" "),n("h3",{attrs:{id:"render-props使用限制"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#render-props使用限制"}},[e._v("#")]),e._v(" "),n("code",[e._v("render props")]),e._v("使用限制")]),e._v(" "),n("p",[e._v("在"),n("code",[e._v("render props")]),e._v("中应该避免使用"),n("code",[e._v("箭头函数")]),e._v("，因为这会造成性能影响。")]),e._v(" "),n("p",[e._v("比如：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("// 不好的示例\nclass MouseTracker extends React.Component {\n  render() {\n    return (\n      <Mouse render={mouse => (\n        <Cat mouse={mouse} />\n      )}/>\n    )\n  }\n}\n")])])]),n("p",[e._v("这样写是不好的，因为"),n("code",[e._v("render")]),e._v("方法是有可能多次渲染的，使用"),n("code",[e._v("箭头函数")]),e._v("，会导致每次渲染的时候，传入"),n("code",[e._v("render")]),e._v("的值都会不一样，而实际上并没有差别，这样会导致性能问题。")]),e._v(" "),n("p",[e._v("所以更好的写法应该是将传入"),n("code",[e._v("render")]),e._v("里的函数定义为实例方法，这样即便我们多次渲染，但是绑定的始终是同一个函数。")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("// 好的示例\nclass MouseTracker extends React.Component {\n  renderCat(mouse) {\n   return <Cat mouse={mouse} />\n  }\n\n  render() {\n    return (\n    <Mouse render={this.renderTheCat} />\n    )\n  }\n}\n")])])]),n("h3",{attrs:{id:"render-props的优缺点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#render-props的优缺点"}},[e._v("#")]),e._v(" "),n("code",[e._v("render props")]),e._v("的优缺点")]),e._v(" "),n("ul",[n("li",[n("p",[e._v("优点")])]),e._v(" "),n("li",[n("ul",[n("li",[e._v("props 命名可修改，不存在相互覆盖；")]),e._v(" "),n("li",[e._v("清楚 props 来源；")]),e._v(" "),n("li",[e._v("不会出现组件多层嵌套；")])])]),e._v(" "),n("li",[n("p",[e._v("缺点")])]),e._v(" "),n("li",[n("ul",[n("li",[n("p",[e._v("写法繁琐；")])]),e._v(" "),n("li",[n("p",[e._v("无法在"),n("code",[e._v("return")]),e._v("语句外访问数据；")])]),e._v(" "),n("li",[n("p",[e._v("容易产生函数回调嵌套；")]),e._v(" "),n("p",[e._v("如下代码：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v("const MyComponent = () => {\n  return (\n    <Mouse>\n      {({ x, y }) => (\n        <Page>\n          {({ x: pageX, y: pageY }) => (\n            <Connection>\n              {({ api }) => {\n                // yikes\n              }}\n            </Connection>\n          )}\n        </Page>\n      )}\n    </Mouse>\n  )\n}\n")])])])])])])]),e._v(" "),n("h2",{attrs:{id:"hook"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#hook"}},[e._v("#")]),e._v(" "),n("strong",[e._v("Hook")]),e._v("**—**")]),e._v(" "),n("p",[n("code",[e._v("React")]),e._v("的核心是组件，因此，"),n("code",[e._v("React")]),e._v("一直致力于优化和完善声明组件的方式。从最早的"),n("code",[e._v("类组件")]),e._v("，再到"),n("code",[e._v("函数组件")]),e._v("，各有优缺点。"),n("code",[e._v("类组件")]),e._v("可以给我们提供一个完整的生命周期和状态（state）,但是在写法上却十分笨重，而"),n("code",[e._v("函数组件")]),e._v("虽然写法非常简洁轻便，但其限制是"),n("strong",[e._v("必须是纯函数，不能包含状态，也不支持生命周期")]),e._v("，因此"),n("code",[e._v("类组件")]),e._v("并不能取代"),n("code",[e._v("函数组件")]),e._v("。")]),e._v(" "),n("p",[e._v("而"),n("code",[e._v("React")]),e._v("团队觉得"),n("strong",[e._v("组件的最佳写法应该是函数，而不是类")]),e._v("，由此产生了"),n("code",[e._v("React Hooks")]),e._v("。")]),e._v(" "),n("p",[n("strong",[e._v('React Hooks 的设计目的，就是加强版函数组件，完全不使用"类"，就能写出一个全功能的组件')]),e._v("。")]),e._v(" "),n("p",[e._v("为什么说"),n("code",[e._v("类组件")]),e._v("“笨重”，借用"),n("code",[e._v("React")]),e._v("官方的例子说明：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import React, { Component } from "react"\n\nexport default class Button extends Component {\n  constructor() {\n    super()\n    this.state = { buttonText: "Click me, please" }\n    this.handleClick = this.handleClick.bind(this)\n  }\n  handleClick() {\n    this.setState(() => {\n      return { buttonText: "Thanks, been clicked!" }\n    })\n  }\n  render() {\n    const { buttonText } = this.state\n    return <button onClick={this.handleClick}>{buttonText}</button>\n  }\n}\n')])])]),n("p",[e._v("以上是一个简单的按钮组件，包含最基础的状态和点击方法，点击按钮后状态发生改变。")]),e._v(" "),n("p",[e._v("本是很简单的功能组件，但是却需要大量的代码去实现。由于"),n("code",[e._v("函数组件")]),e._v("不包含状态，所以我们并不能用"),n("code",[e._v("函数组件")]),e._v("来声明一个具备如上功能的组件。但是我们可以用"),n("code",[e._v("Hook")]),e._v("来实现：")]),e._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[e._v('import React, { useState } from "react"\n\nexport default function Button() {\n  const [buttonText, setButtonText] = useState("Click me,   please")\n\n  function handleClick() {\n    return setButtonText("Thanks, been clicked!")\n  }\n\n  return <button onClick={handleClick}>{buttonText}</button>\n}\n')])])]),n("p",[e._v("相较而言，"),n("code",[e._v("Hook")]),e._v("显得更轻量，在贴近"),n("code",[e._v("函数组件")]),e._v("的同时，保留了自己的状态。")]),e._v(" "),n("p",[e._v("在上述例子中引入了第一个钩子"),n("code",[e._v("useState()")]),e._v("，除此之外，"),n("code",[e._v("React")]),e._v("官方还提供了"),n("code",[e._v("useEffect()")]),e._v("、"),n("code",[e._v("useContext()")]),e._v("、"),n("code",[e._v("useReducer()")]),e._v("等钩子。具体钩子及其用法详情请见"),n("strong",[e._v("官方")]),e._v("[3]。")]),e._v(" "),n("p",[n("code",[e._v("Hook")]),e._v("的灵活之处还在于，除了官方提供的基础钩子之外，我们还可以利用这些基础钩子来封装和自定义钩子，从而实现更容易的代码复用。")]),e._v(" "),n("h3",{attrs:{id:"hook-优缺点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#hook-优缺点"}},[e._v("#")]),e._v(" Hook 优缺点")]),e._v(" "),n("ul",[n("li",[n("p",[e._v("优点")])]),e._v(" "),n("li",[n("ul",[n("li",[e._v("更容易复用代码；")]),e._v(" "),n("li",[e._v("清爽的代码风格；")]),e._v(" "),n("li",[e._v("代码量更少；")])])]),e._v(" "),n("li",[n("p",[e._v("缺点")])]),e._v(" "),n("li",[n("ul",[n("li",[e._v("状态不同步（函数独立运行，每个函数都有一份独立的作用域）")]),e._v(" "),n("li",[e._v("需要更合理的使用"),n("code",[e._v("useEffect")])]),e._v(" "),n("li",[e._v("颗粒度小，对于复杂逻辑需要抽象出很多"),n("code",[e._v("hook")])])])])]),e._v(" "),n("h2",{attrs:{id:"总结"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[e._v("#")]),e._v(" "),n("strong",[e._v("总结")]),e._v("**—**")]),e._v(" "),n("p",[e._v("除了"),n("code",[e._v("Mixin")]),e._v("因为自身的明显缺陷而稍显落后之外，对于"),n("code",[e._v("高阶组件")]),e._v("、"),n("code",[e._v("render props")]),e._v("、"),n("code",[e._v("react hook")]),e._v("而言，并没有哪种方式可称为"),n("code",[e._v("最佳方案")]),e._v("，它们都是优势与劣势并存的。哪怕是最为最热门的"),n("code",[e._v("react hook")]),e._v("，虽然每一个"),n("code",[e._v("hook")]),e._v("看起来都是那么的简短和清爽，但是在实际业务中，通常都是一个业务功能对应多个"),n("code",[e._v("hook")]),e._v("，这就意味着当业务改变时，需要去维护多个"),n("code",[e._v("hook")]),e._v("的变更，相对于维护一个"),n("code",[e._v("class")]),e._v("而言，心智负担或许要增加许多。只有切合自身业务的方式，才是"),n("code",[e._v("最佳方案")]),e._v("。")]),e._v(" "),n("hr"),e._v(" "),n("p",[n("strong",[e._v("参考资料")])]),e._v(" "),n("p",[e._v("[1]React Mixin 的使用: "),n("em",[e._v("https://segmentfault.com/a/1190000003016446")]),e._v("[2]Mixins Considered Harmful: "),n("em",[e._v("https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html")]),e._v("[3]官方: "),n("em",[e._v("https://zh-hans.reactjs.org/docs/hooks-reference.html")]),e._v("[4]React Mixin 的使用: "),n("em",[e._v("https://segmentfault.com/a/1190000003016446")]),e._v("[5]Mixins Considered Harmful: "),n("em",[e._v("https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html")]),e._v("[6]Higher-Order Components: "),n("em",[e._v("https://reactjs.org/docs/higher-order-components.html")]),e._v("[7]Render Props: "),n("em",[e._v("https://reactjs.org/docs/render-props.html")]),e._v("[8]React 拾遗：Render Props 及其使用场景: "),n("em",[e._v("https://www.imooc.com/article/39388")]),e._v("[9]Hook 简介: "),n("em",[e._v("https://zh-hans.reactjs.org/docs/hooks-state.html")])])])}),[],!1,null,null,null);n.default=v.exports}}]);