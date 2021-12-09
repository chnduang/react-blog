

### TDD 与BDD

#### 测试驱动开发

> Test Driven Development (TDD) 测试驱动开发

##### 开发流程

+ 编写测试用例
+ 运行测试，测试用例无法通过测试
+ 编写代码，使测试用例通过测试
+ 优化代码，完成开发
+ 新添加，继续重复上述步骤

##### TDD的优势

+ 长期减少回归bug
+ 代码质量更好
+ 测试覆盖率高

#### 行为驱动开发

> BDD(Behavior Driven Developmen)
> 先编写代码，基于用户的行为去编写测试代码

#### TDD 与BDD 区别

##### TDD:

+ 先写测试再写代码
+ 一般结合单元测试使用，是白盒测试
+ 测试重点在代码
+ 安全低（重点在代码对与用户交互给人的安全低）
+ 测试速度快

##### BDD:

+  先写代码再写测试
+  一般结合集成测试使用，是黑盒测试
+  测试重点在UI(DOM)
+  安全感高（基于用户使用的测试，给人的安全感高）
+  测试速度慢



### TDD开发

#### app.vue

```vue
<template>
  <div id="app">
    <TodoList/>
  </div>
</template>

<script>
import TodoList from './containers/TodoList'

export default {
  name: 'app',
  components: {
    TodoList
  }
}
</script>
<style lang="stylus">
*{
  margin:0;
  padding 0;
}
html,body{
  height 100%;
  background :#CDCDCD;

}
</style>

```



#### todoList.test.js

```js
import { shallowMount } from '@vue/test-utils'
import TodoList from '../../TodoList.vue'
import Undolist from '../../components/Undolist.vue'
// shallowMount浅渲染，只渲染当前组件，不渲染包含的子组件，适合单元测试，
// mount 全渲染，适合集成测试
describe('TodoList.vue', () => {
  it('TodoItem 初始化时，undoList应该为空', () => {
    const wrapper = shallowMount(TodoList)
    const undoList = wrapper.vm.$data.undoList
    expect(undoList).toEqual([])
  })
  it('Todolist 监听到header的add事件是，，undoList数组会增加一个内容', () => {
    const wrapper = shallowMount(TodoList)
    wrapper.vm.addUntodoItem(1)
    expect(wrapper.vm.undoList).toEqual([1])
  })
  it('Todolist 调用 UndoList 应该传递 list 参数', () => {
    const wrapper = shallowMount(TodoList)
    wrapper.setData({ undoList: [1, 2, 3] })
    const undolist = wrapper.find(Undolist)
    const list = undolist.props('list')
    expect(list).toEqual([1, 2, 3])
  })

  it('Todolist 调用 delUndoItem方法 undoList列表内容会减少一个 ', () => {
    const wrapper = shallowMount(TodoList)
    wrapper.setData({ undoList: [1, 2, 3] })
    wrapper.vm.delUndoItem(1)
    expect(wrapper.vm.undoList).toEqual([1, 3])
  })

```



#### todoList.vue

```vue
<template>
  <div class="todoList">
    <Header @add="addUntodoItem"></Header>
    <UndoList @delUndoItem="delUndoItem" :list="undoList"></UndoList>
  </div>
</template>

<script>
import Header from './components/Header'
import UndoList from './components/UndoList'
export default {
  name: 'TodoList',
  components: {
    Header,
    UndoList
  },

  data () {
    return {
      undoList: []
    }
  },
  methods: {
    addUntodoItem (data) {
      this.undoList.push(data)
    },
    delUndoItem (data) {
      this.undoList.splice(data, 1)
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">

.todoList{
  width :100%;
  height :100%
}
</style>
```

#### header.test.js

```js
import { shallowMount } from '@vue/test-utils'
import Header from '../../components/Header.vue'
// shallowMount浅渲染，只渲染当前组件，不渲染包含的子组件，适合单元测试，
// mount 全渲染，适合集成测试

describe('Header.vue', () => {
  it('Header 样式发送改变， 做提示', () => {
    const wrapper = shallowMount(Header)

    // 生成快照，当页面样式写好后可以添加快照，用于提示
    expect(wrapper).toMatchSnapshot()
  })
  it('header 包含 input 框', () => {
    const wrapper = shallowMount(Header)
    const input = wrapper.find('[data-test="input"]')
    // 判断input原生是否存在
    expect(input.exists()).toBe(true)
  })

  it('input 框 初始内容为空', () => {
    const wrapper = shallowMount(Header)

    const inputValue = wrapper.vm.$data.inputValue
    expect(inputValue).toBe('')
  })

  it('Header 中 input 框 值发送变化，数据应该跟着变化', () => {
    const wrapper = shallowMount(Header)
    const input = wrapper.find('[data-test="input"]')
    input.setValue('TodoList')
    const inputValue = wrapper.vm.$data.inputValue
    expect(inputValue).toBe('TodoList')
  })

  it('Header 中 input 框 无内容时，按回车不触发事件', () => {
    const wrapper = shallowMount(Header)
    const input = wrapper.find('[data-test="input"]')
    input.setValue('')
    input.trigger('keyup.enter')
    // 是否向父组件提交add事件
    expect(wrapper.emitted().add).toBeFalsy()
  })

  it('Header 中 input 框 有内容时，按回车触发事件 同时清空', () => {
    const wrapper = shallowMount(Header)
    const input = wrapper.find('[data-test="input"]')
    input.setValue('Todolist')
    input.trigger('keyup.enter')
    const inputValue = wrapper.vm.inputValue
    // 是否向父组件提交add事件
    expect(wrapper.emitted().add).toBeTruthy()
    expect(inputValue).toBe('')
  })
})
```

#### header.vue

```vue
<template>
  <div class="header">
    <div class="title">TodoList</div>
    <input
    class="header-input"
     type="text"
    data-test="input"
    @keyup.enter="add"
     v-model="inputValue"
     placeholder="todoItem"
     >
  </div>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      inputValue: ''
    }
  },
  methods: {
    add () {
      if (this.inputValue) {
        this.$emit('add', this.inputValue)
        this.inputValue = ''
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.header{
  height :60px;
  background :#666;
  display :flex;
  justify-content :center;
  align-items :center;
}
.title{
  font-size :40px;
  color :#fff;
  margin-right :100px;
}
.header-input{
  height :20px;
  text-indent 10px;
  outline :none;
  width :300px;
}
</style>
```




#### undolist.test.js

```js
import { shallowMount } from '@vue/test-utils'
import UndoList from '../../components/UndoList.vue'  

  describe('Undolist.vue',()=>{
    it('UndoList 参数为[],count值为0',()=>{
      const wrapper = shallowMount(UndoList,{
        propsData:{list:[]}
      })
      const countElem = wrapper.find('[data-test="count"]')
      const ListTtems = wrapper.findAll('[data-test="item"]')
      expect(countElem.text()).toEqual('0')
      expect(ListTtems.length).toEqual(0)
    })

    it('UndoList 参数为[1,2,3],count值为3, 且列表有内容, 且存在删除按钮',()=>{
      const wrapper = shallowMount(UndoList,{
        propsData:{list:[1,2,3]}
      })
      const countElem = wrapper.find('[data-test="count"]')
      const ListTtems = wrapper.findAll('[data-test="item"]')
      const delBtns = wrapper.findAll('[data-test="delBtn"]')
      expect(countElem.text()).toEqual('3')
      expect(ListTtems.length).toEqual(3)
      expect(delBtns.length).toEqual(3)
    })

    it('删除按钮被点击时，向外触发删除事件',()=>{
      const wrapper = shallowMount(UndoList,{
        propsData:{list:[1,2,3]}
      })
      // 找到第2个删除按钮
      const delBtns = wrapper.findAll('[data-test="delBtn"]').at(1)
      delBtns.trigger('click')
       expect(wrapper.emitted().delUndoItem).toBeTruthy()
    })
  })

```


#### undolist.vue

```vue
<template>
  <div class="undolist">
    <div class="undoList-title">
      <p>正在进行</p>
        <div data-test="count" class="count">{{list.length}}</div>
    </div>
    <ul class="item-wrap">
      <li data-test="item"
      class="item"
      v-for="(item,index) in list"
      :key="index"
      >
      {{item}}
      <span class="delBtn" data-test="delBtn" @click="delUndolist(index)"> - </span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Undulist',
  props: {
    list: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {

    }
  },
  methods: {
    delUndolist (data) {
      this.$emit('delUndoItem', data)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.undoList-title{
  display : flex;
  justify-content :space-between;
  align-items center;
  width :500px;
  margin : 50px auto;
  text-align center;
}
.undoList-title>p{
  font-size :30px;
  font-weight :bold;
}
.count{
  background :#E6E6FA;
  width :20px;
  height 20px;
  border-radius :50%;
  color: #666;
  font-size: 14px;
}
.item-wrap{
   width :500px;
  margin : 0 auto;
  padding :0;
 
}
.item{
   text-align center;
  display : flex;
  justify-content :space-between;
  padding : 10px 20px;
  box-sizing :border-box;
  align-items center;
  background :rgb(245,245,245);
  margin-bottom :20px;
  border-radius :5px;
  border-left :5px solid  #629A9C
}
.delBtn{
   background :#ccc;
  width :20px;
  height 20px;
  border-radius :50%;
  color: #fff;
  line-height :20px;
  font-size: 14px;
}
</style>
```

### BDD实战示例

下列就是根据上述写好的，来测试，这里就示例一下，

```js
it(`
	1.用户在输入框中输入了内容，
	2.用户会点击回车按钮
	3.列表项应该增加用户输入内容的列表项
	`,()=>{
    const wrapper = mount(todoList)
    const inputElem = wrapper.find('[data-test="input"]')
    const content = "toDoList
    inputElem.setValue(content)
    inputElem.trigger('change')
    inputElem.tigger('keyup.enter')
    const listItems = wrapper.findAll('[data-test=item]')
    expect(listItems.length).toBe(1)
    expect(listItems.at(0).text()).toContain(content)
})
```

>是否发现异常繁琐，TDD开发模式更适用于开发，类似方法函数库，对于数据的处理，对于这种显示组件，更加推荐于
> BDD的开发方式，这样既有了测试，也不会增加过多的工作负担，