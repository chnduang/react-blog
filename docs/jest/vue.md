### vue自动化测试

创建一个vue项目，勾选上jest，生成一个包含jest的vue文件

更多请查看 [Vue Test Utils](https://vue-test-utils.vuejs.org/zh/) 文档

常用api

```js
mount
创建一个包含被挂载和渲染的 Vue 组件的 Wrapper。
shallowMount  
和 mount 一样，创建一个包含被挂载和渲染的 Vue 组件的 Wrapper，不同的是被存根的子组件
wrapper options
	wrapper.vm
                这是该 Vue 实例。你可以通过 wrapper.vm 访问一个实例所有的方法和属性。这只存在于 Vue 组件包裹器                  或绑定了 Vue 组件包裹器的 HTMLElement 中
       .contains
				判断 Wrapper 是否包含了一个匹配选择器的元素或组件。
		.emitted
				执行一个自定义事件。返回一个包含由 Wrapper vm 触发的自定义事件的对象。
         .trigger
				为 WrapperArray 的每个 Wrapper DOM 节点都触发一个事件。
		.find
				返回匹配选择器的第一个 DOM 节点或 Vue 组件的 Wrapper。
         .findAll
				返回所有，类似jquery
         .props   
				返回 Wrapper vm 的 props 对象。如果提供了 key，则返回这个 key 对应的值
```

配置 jest.config.js

```js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
    moduleFileExtensions: [ 'js', 'jsx', 'json', 'vue' ], //查找文件的后缀
    transform: { //匹配到对应的后缀文件使用对应的转化
      '^.+\\.vue$': 'vue-jest', //解析vue语法，
      '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',//将静态资源转换为字符
      '^.+\\.jsx?$': 'babel-jest' //es6语法转换es5
    },
    transformIgnorePatterns: [ //不需要转换的文件
      '/node_modules/'
    ],
    moduleNameMapper: { //路径映射，
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    snapshotSerializers: [ //对快照vue语法编译
      'jest-serializer-vue'
    ],
    testMatch: [ //测试文件位置，满足下列规则就当成测试文件
      '**/tests/unit/**/*.(spec|test).(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
    ],
    testURL: 'http://localhost/', //测试下的浏览器地址
    watchPlugins: [ //添加交互选择
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ]
  }
```

如果你是手动按照最开始那种安装jest， 那么 jest-watch-typeahead/filename、 jest-watch-typeahead/testname、jest-serializer-vue、babel-jest、jest-transform-stub、@vue/cli-plugin-unit-jest、vue-jest 这些包就需要你手动安装一下，

packge.json

如果你的项目没有git初始化，请使用–watchAll

接下来我们找到vue的tests 示例 发现和jest不一样,不慌，我们先用另一个写法实现一下,vue的test-utils, 为我们提供了一些用于测试的api可以查看官网，

```js
import { shallowMount } from '@vue/test-utils' 
// shallowMount浅渲染，只渲染当前组件，不渲染包含的子组件，适合单元测试，
// mount 全渲染，适合集成测试
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    //一个 Wrapper 是一个包括了一个挂载组件或 vnode，以及测试该组件或 vnode 的方法。
    //wrapper.vm,可以访问到vue的实例
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    //返回 Wrapper 的文本内容。渲染的文本中包含msg
    expect(wrapper.text()).toMatch(msg)
  })
})
```

//模拟一个上述实现

```js
import Vue from 'vue'
import HelloWorld from ' @/components/HelloWorld '
describe( 'HelloWorld.vue', () => {
	it(' renders props.msg when passed',() =>{
        const root = document. createElement( 'div');
        root. className ='root' ;
        document.body.appendChild( root) ;
        new Vue({
         render: h => h(HelloWorld,{
             props:{
                 msg: 'dell lee'
             }
         })
            }).$mount( '.root' )
        consloe.log(document.body.innerHTML);
        expect ( document.getElementsByClassName( 'hello' ). length). toBe(1);
      })
})
```

#### 测试 vuex

对store进行的单元测试

store.js

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state:{
    value:1
  },
  mutations:{
    ADD:(state,data)=>{
      state.value = data
    }
  },
  actions:{
    commitAdd:({commit},data)=>{
      commit("ADD")
    }
  }
})

export default store
import store from '@/store'
it(`当 store 执行add发生变化`, ()=>{
const value = 123 ;
store.commit( ' ADD', value);
expect( store.state.value).toBe( value);
})
```

当你的测试文件使用了store，需要在挂载的时候，将store传入,否则store会找不到

```js
import store from '../../store'
it(`
	使用store
	`,()=>{
    const wrapper = mount(todoList,{store})
	........
})
```

#### vue中的异步测试

我们不需要请求真实的的地址，我们只需要在tests文件同级建立一个新文件夹`_mocks_`下面新建一个axios.js

axios.js 示例

```js
export defult get(url){ //模拟get方法
    if (url === '/axios.json'){
        return new promise((resolve)=>{
            const data = [{value:1},{value:2}]
            resolve(data)
        })
    }
}
```

在test文件调用mount时会执行，mounted，在执行请求获取数据时，test会优先查看`_mocks_` 下面的axios.js 去替换真实的请求

```js
import store from '../../store'
it(`
	1. 用户进入页面时，请求远程数据
	2. 列表应该展示远程返回的数据
	`,(done)=>{
    const wrapper = mount(todoList,{store})
    //异步测试，需要使用nextTick和done来等待挂载成功后再执行，jest不会自己等待异步
    wrapper.vm.$nextTick(()=>{
    const listItems = wrapper.findAll('[data-test=item]')
    expect(listItems.length).toBe(2)
         done()
    })
})
```

如果存在定时器

模拟的测试组件

```vue
<template>
		<div>
            <ul>
                <li v-for="item in data" data-test="item">{{item}}</li>
   		 </ul>
    </div>
</template>
<script>
export defult {
 data(){
	return {
	data:[]
	}
}
method:{
	getList(){
	setTimeout(()=>{
		axios.get('/axios.json').then((res)=>{
			this.data = res.data
		})
	},4000)
	}
}
}
</script>
```

错误示例

在测试代码存在异步的代码，jest并不会去等待定时器执行完，会直接忽略，如果需要，需要使用done()

这样确实可以，但是会等待4秒并不是我们想要的结果

```js
it(`
	1. 用户进入页面时，等待4秒
	2. 列表应该展示远程返回的数据
	`,(done)=>{
    const wrapper = mount(todoList)
    	setTimeout(()=>{
		  const listItems = wrapper.findAll('[data-test=item]')
    		expect(listItems.length).toBe(2)
            done()
	},4000)
   
})
```

正确示例

```js
beforEach(()=>{
	jest.useFakeTimets() //用于模拟定时器
})
it(`
	1. 用户进入页面时，等待4秒
	2. 列表应该展示远程返回的数据
	`,(done)=>{
    const wrapper = mount(todoList)
 	jest.tunAllTimers() //如果遇到timers让他立即执行
     wrapper.vm.$nextTick(()=>{
    const listItems = wrapper.findAll('[data-test=item]')
    expect(listItems.length).toBe(2)
         done()
    })
})
```