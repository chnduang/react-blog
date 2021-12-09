## [Jest](https://jestjs.io/zh-Hans/)

> 一般使用 Enzyme 中的 `mounJt` 或 `shallow` 方法，将目标组件转化为一个 `ReactWrapper`对象，并在测试中调用其各种方法：

```js
import Enzyme,{ mount } from 'enzyme';

describe('test ...', function() {

    it('should ...', function() {
        wrapper = mount(
            <MyComp isDisabled={true} />
        );
        expect( wrapper.find('input').exists() ).toBeTruthy();
    });
});
```

#### [global api](https://jestjs.io/docs/zh-Hans/api)

> 官方文档中有详细介绍，并且有中文版

## [Enzyme](https://airbnb.io/enzyme/)

> 是官方测试工具库的封装，它模拟了jQuery的API

#### 三种测试方法

- `shallow`
- `render`
- `mount`

#### [shallow](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md)

> 方法就是官方的shallow rendering的封装。

+ 测试`App`的标题。

```javascript
import {shallow} from 'enzyme';

describe('Enzyme Shallow', function () {
  it('the title should be Todos', function () {
    const app = shallow(<App/>);
    expect(app.find('h1').text()).toEqual('Todos');
  });
};
         
// 上面代码中，`shallow`方法返回`App`的浅渲染，然后`app.find`方法找出`h1`元素，`text`方法取出该元素的文本。
```

+ 关于`find`方法，有一个注意点，就是它只支持简单选择器，稍微复杂的一点的CSS选择器都不支持。

```bash
component.find('.my-class'); // by class name
component.find('#my-id'); // by id
component.find('td'); // by tag
component.find('div.custom-class'); // by compound selector
component.find(TableRow); // by constructor
component.find('TableRow'); // by display name
```

#### render

> [`render`](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md)方法将React组件渲染成静态的HTML字符串，然后分析这段HTML代码的结构，返回一个对象。它跟`shallow`方法非常像，主要的不同是采用了第三方HTML解析库Cheerio，它返回的是一个Cheerio实例对象。

+ 测试所有Todo项的初始状态。

```javascript
import {render} from 'enzyme';

describe('Enzyme Render', function () {
  it('Todo item should not have todo-done class', function () {
    const app = render(<App/>);
    expect(app.find('.todo-done').length).to.equal(0);
  });
});

// 在上面代码中，你可以看到，`render`方法与`shallow`方法的API基本是一致的。 Enzyme的设计就是，让不同的底层处理引擎，都具有同样的API（比如`find`方法）
```

#### mount

> [`mount`](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md)方法用于将React组件加载为真实DOM节点。
>
> **注意**：与浅层或静态渲染不同，完全渲染实际上将组件安装在DOM中，这意味着如果测试全部使用相同的DOM，则测试可以相互影响。在编写测试时请记住这一点，并在必要时使用`.unmount()`或类似清理。

+ 测试删除按钮。

```javascript
import {mount} from 'enzyme';

describe('Enzyme Mount', function () {
  it('Delete Todo', function () {
    const app = mount(<App/>);
    const todoLength = app.find('li').length;
    app.find('button.delete').at(0).simulate('click');
    expect(app.find('li').length).to.equal(todoLength - 1);
  });
});

//上面代码中，`find`方法返回一个对象，包含了所有符合条件的子组件。在它的基础上，`at`方法返回指定位置的子组件，`simulate`方法就在这个组件上触发某种行为。
```

+ 测试Todo项的点击行为。

```javascript
import {mount} from 'enzyme';

describe('Enzyme Mount', function () {
  it('Turning a Todo item into Done', function () {
    const app = mount(<App/>);
    const todoItem = app.find('.todo-text').at(0);
    todoItem.simulate('click');
    expect(todoItem.hasClass('todo-done')).to.equal(true);
  });
});
```

+ 测试添加新的Todo项。

```javascript
import {mount} from 'enzyme';

describe('Enzyme Mount', function () {
  it('Add a new Todo', function () {
    const app = mount(<App/>);
    const todoLength = app.find('li').length;
    const addInput = app.find('input').get(0);
    addInput.value = 'Todo Four';
    app.find('.add-button').simulate('click');
    expect(app.find('li').length).to.equal(todoLength + 1);
  });
});
```

### Enzyme部分API

> api基本与jquery相同，可在官网查看api，以下是常用的几个api
>
> https://cheerio.js.org/

```js
.get(index)：返回指定位置的子组件的DOM节点
.at(index)：返回指定位置的子组件
.first()：返回第一个子组件
.last()：返回最后一个子组件
.type()：返回当前组件的类型
.text()：返回当前组件的文本内容
.html()：返回当前组件的HTML代码形式
.props()：返回根组件的所有属性
.prop(key)：返回根组件的指定属性
.state([key])：返回根组件的状态
.setState(nextState)：设置根组件的状态
.setProps(nextProps)：设置根组件的属性
```

