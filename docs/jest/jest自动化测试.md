

## 自动化测试-jest学习与使用

### 自动化测试概念

> 编写一段js 去运行生产中的js代码
> 我们预期会出现的结果与实际出现的结果是否相等
> 在上线前检测成问题，这样通过代码自动检测

### 自动化测试的优势

+ 更好的代码组织，项目的可维护性增强
+ 更小的Bug出现概率，尤其是回归测试中的Bug
+ 修改工程质量差的项目，更加安全
+ 项目具备潜在的文档特性
+ 扩展前端知识面
+ 学习自动化测试更有利于读懂各种源码，测试用例其实就是源码的文档，他详细告诉了实现的功能

> 测试：单元测试，和集成测试
>
> 单元测试
> 只关注，该单元的代码，对于外部的引入不关心，如果对性能有影响就会用mock
> 就想上面的测试demo，只关心有没有执行过a,b方法并不关心执行的结果
>
> 简单说就是对单一功能的测试
>
> 集成测试
> 对单元中所有都测试
> 我不仅要执行，同时也关心执行后对该单元的影响
>
> 对多种功能的集合测试

### Jest初始化工程

#### 安装

```js
yarn add jest @babel/preset-env @babel/core -D
```

#### 配置jest

> 使用以下命令会在项目的根目录新增一个`jest.config.js`的文件
>
> 运行jest的配置文件

```js
npx jest --init
```

#### package.json

```js
"scripts": {
  "test": "jest --watch"，
  "test:cover": "jest --coverage"
},
  
// 按 o 的时候报错
// 需要在git中使用，通过git来记录修改的文件所以要安装git并初始化git文件同时需要提交到本地
–watch is not supported without git/hg, please use --watchAll
```
#### 测试覆盖率

+ 在jest.config.js中 添加

```js
 coverageDirectory: "coverage",//生成代码覆盖率报告会放在coverage目录下
```

+ 会在根目录生成coverage文件夹，点击打开lcov-report 下的 index.html 就能看见图形化界面

> jest 默认是commoJs的规范是在node环境下运行，如果想用es6的语法，需要安装babel转换
> 在你运行jest时，jest内部封装了，会运行 jest（babel-jest)检测你是否安装了babel-core，就会去取.babelrc的配置,
> 运行测试前结合babel先把代码进行一次转化

#### 配置.babelrc

> 在根目录新建一个文件.babelrc
>

```js
{
  "presets": ["@babel/preset-env"]
}
```

#### jest 相关命令

> 当没有改动或者错误的文件时，再次按对应提示单词就能退出当前模式

```js
// 按 f 以仅运行失败的测试。
› Press f to run only failed tests.
// 按 o 仅运行与已更改文件相关的测试。
 › Press o to only run tests related to changed files.
//  按 p 以按文件名正则表达式模式进行筛选
//只想执行那些测试文件就可以用p模式 
 › Press p to filter by a filename regex pattern.
//  按 t 以按测试名称 regex 模式进行筛选
// 只想执行那些测试用例就可以用t模式 也叫feilter模式
 › Press t to filter by a test name regex pattern.
//  按q退出监视
 › Press q to quit watch mode.
//  按u确定更新快照（只在快照时显示）
 › Press u to update failing snapshots.
//  按i以交互方式更新失败的快照。
  Press i to update failing snapshots interactively.
// 按 s 跳过当前用例
   Press s to skip the current test.
//  按 Enter 可触发测试运行。
 › Press Enter to trigger a test run.
//  按w展示所有使用方式
 Watch Usage: Press w to show more.
```

### Jest使用

> 以下是简单的测试用例但会涉及jest中常用的一些方法
>
>  对于归类分组，你可以手动自己分文件，来归类，也可以用describe来分类

新建一个math.js 用来创建 加减方法

```js
export function add(x,y){
  return x+y
}

export function minus(x,y){
  return x-y
}
export function multi(x,y){
  return x*y
}
```

下面我们就来测试一下这个math.js

> 通过代码去执行方法，或模拟用户行为

```js
//引入需要测试的方法
import {add,minus,multi} from './math'

test('测试加法 3+3',()=>{
  //我期望3+3得到6
  expect(add(3,3)).toBe(6)
})
test('测试减法 3-3',()=>{
  expect(minus(3,3)).toBe(0)
})
test('测试乘法 3*3',()=>{
  expect(multi(3,3)).toBe(9)
})
```

test原理 简单用原生js来实现一下上述代码

```js
import {add,minus,multi} from './math'

var result = add(3,7);
var expected = 10;
if(result!== expected){
  throw Error(`3+7应该等于${expected},但是结果却是${result}`)
}

var result = minus(3,3);
var expected = 0;
if(result!== expected){
  throw Error(`3-3应该等于${expected},但是结果却是${result}`)
}

// 实现一个
//  expect(add(3,3)).toBe(6)
//  expect(minus(6,3)).toBe(3)
function expect (result){
  return {
    toBe: function(actual){
        if(result!==actual){
          throw new Error(`预期值和实际值不相等 预期${actual} 结果却是${result}`)
        }
    }
  }
}
//  expect(add(3,3)).toBe(6)

// 进一步完善
function test (desc,fn){
  try{
    fn()
    console.log(`${desc}通过测试`);
  } catch(e){
    console.log(`${desc}没有通过测试 ${e}`);
  }
}

test('测试加法 3+3',()=>{
  expect(add(3,3)).toBe(6)
})
```

#### jest匹配器

```js
test('测试10与10匹配',()=>{
  //toBe 匹配器
  //类似 object.is  ===
  // 只能匹配值，不能匹配对象等引用
  expect(10).toBe(10)
})


test ('测试对象内容相等',()=>{
  //toEqual 匹配器
  // 能匹配值，对象等引用
  const a = {one:1};
  expect(a).toEqual({one:1})
})

test ('测试内容为null',()=>{
  //toBeNull 匹配器
  const a = null;
  expect(a).toBeNull();
})

test ('测试内容为undefined',()=>{
  //toBeUndefined 匹配器
  const a = undefined;
  expect(a).toBeUndefined();
})

test ('测试内容为defined',()=>{
  //toBeDefined 匹配器
  const a = null;
  expect(a).toBeDefined();
})

test("测试内容为真",()=>{
  // toBeTruthy 匹配器
  const a = 1;
  expect(a).toBeTruthy()
})
test("测试内容为假",()=>{
  // toBeFalsy 匹配器
  const a = 0;
  expect(a).toBeFalsy()
})

test("不为真",()=>{
  // not 匹配器取反操作
  const a = 1
  expect(a).not.toBeFalsy()
})
// 数字相关匹配器

test('count大于9',()=>{
  const count = 10
  expect(count).toBeGreaterThan(9);
})

test('count小于9',()=>{
  // toBeLessThanOrEqual
  const count = 8
  expect(count).toBeLessThan(9);
})
test('count大于等于9',()=>{
  const count = 9
  expect(count).toBeGreaterThanOrEqual(9);
})


// js运算错误示例
test("0.1+0.2",()=>{
  const a = 0.1
  const b = 0.2
  // expect(a+b).toEqual(0.3)
  /* 
   Expected: 0.3
    Received: 0.30000000000000004
*/
// 对于浮点型计算匹配需要使用
// toBeCloseTo
expect(a+b).toBeCloseTo(0.3)
})

// String 相关匹配器
test("str中包含字符",()=>{
    //toMatch 可以是正则表达式
    const str = "www.baidu.com"
    // expect(str).toMatch('baidu')
     expect(str).toMatch(/baid/)
})

// 数组相关匹配器
test("数组中包含某一项",()=>{
  const arr = ['a','b','c']
  // 可以set后在匹配
  expect(arr).toContain('a')
})

// 异常
const throwNewErrorFunc = ()=>{
  throw new Error('this is a new error')
}
test('toThorow',()=>{
  expect(throwNewErrorFunc).toThrow()
  // 如果要填写内容意思就是匹配异常内容相当，也可以是正则表达式
})
```

#### jest中的钩子函数

> 以下列举常用也是重点使用的几个

+ beforeAll 所有测试用例之前
+ beforeEach 每个测试用例执行前都调用
+ afterEach 每个测试用例执行之后
+ afterAll 所有测试用执行之后

> 每一个describe都是一个单独的作用域，可以作用于，下面的所有的describe，
> 同级的互不影响，每个describe都可以拥有独自的钩子函数，执行顺序，先执行外部，再执行内部

新建一个文件counter.js

```js
//模拟用于测试的方法
export default class Counter{
  constructor(){
    this.number = 0
  }
  addOne(){
    this.number+=1
  }
  addTwo(){
    this.number+=2
  }
  minusOne(){
    this.number-=1
  }
  minusTwo(){
    this.number-=2
  }
}
```

测试该文件 新建 counter.test.js

```js
import Counter from "./counter"

// 相同的归类分组
  // 2种方式，一种分文件，一种是用describe分组
describe('测试counter的相关代码',()=>{ 
  console.log('测试counter的相关代码');

  let counter  = null
beforeAll(()=>{
  // 所有测试用例之前
  console.log('beforeAll');
   
})
beforeEach(()=>{
  // 每个测试用例执行前都调用
  console.log('beforeEach');
  counter = new Counter()
})
afterEach(()=>{
  // 每个测试用例执行之后
  console.log('afterEach');
})
afterAll(()=>{
    // 所有测试用例之后
  console.log('AfterAll');
})


    describe('测试增加的代码',()=>{
      beforeEach(()=>{
        console.log('beforeEach to add');
      })
      afterEach(()=>{
        console.log('afterEach to add');
      })
      afterAll(()=>{
        console.log('afterAll to add');
      })
      beforeAll(()=>{
        console.log('beforeAll to add');
      })
      console.log('测试增加的代码');
      test('测试Counter中的addOne方法',()=>{
        console.log('测试Counter中的addOne方法');
        counter.addOne();
        expect(counter.number).toBe(1)
      })
      test('测试Counter中的addTwo方法',()=>{
        console.log('测试Counter中的addTwo方法');
        counter.addTwo();
        expect(counter.number).toBe(2)
      })
    })

    describe('测试减少的代码',()=>{
      console.log('测试减少的代码');
      test('测试Counter中的minusOne方法',()=>{
        console.log('测试Counter中的minusOne方法');
        counter.minusOne();
        expect(counter.number).toBe(-1)
      })
      
        test('测试Counter中的minusTwo方法',()=>{
          console.log('测试Counter中的minusTwo方法');
          counter.minusTwo();
          expect(counter.number).toBe(-2)
        })
    })
  })
  // 如果只想执行某一个用例，可以用test.only来修饰 only可以同时存在多个
/* 
// 每一个describe都是一个单独的作用域，可以作用于，下面的所有的describe，
  同级的互不影响，每个describe都可以拥有独自的钩子函数，执行顺序，先执行外部，再执行内部


*/
/* 
执行顺序如下：
  console.log counter.test.js:7
    测试counter的相关代码

  console.log counter.test.js:44
    测试增加的代码

  console.log counter.test.js:58
    测试减少的代码

  console.log counter.test.js:12
    beforeAll

  console.log counter.test.js:42
    beforeAll to add

  console.log counter.test.js:18
    beforeEach

  console.log counter.test.js:33
    beforeEach to add

  console.log counter.test.js:46
    测试Counter中的addOne方法

  console.log counter.test.js:36
    afterEach to add

  console.log counter.test.js:23
    afterEach

  console.log counter.test.js:39
    afterAll to add

  console.log counter.test.js:18
    beforeEach

  console.log counter.test.js:60
    测试Counter中的minusOne方法

  console.log counter.test.js:23
    afterEach

  console.log counter.test.js:27
    AfterAll
*/
```

#### jest测试异步代码

> 安装 axios
>

```js
yarn add axios -D
```

新建文件 fetchData用于模拟异步代码

```js
import axios from 'axios'
//该接口返回值
//{
 // "success": true
//}
//回调类型的异步函数
export const fetchDataCbk = function(fn){
  axios.get('/api/demo.json')
.then(function(response) {
  fn(response.data)
})
}
//无回调类型的异步函数
export const fetchData = function(){
  return axios.get('/react/api/demo.json')
}
```

测试文件fetchData.test.js

```js
import {fetchData,fetchDataCbk} from "./fetchData"
// 回调类型的异步函数测试
// 只有执行到done执行才结束
test('用done来测试返回结果为{success:true}',(done)=>{
  fetchDataCbk((data)=>{
    expect(data).toEqual({
      success: true
    })
    done()
  })
  
})

// 无回调类型的异步函数测试
//多种实现方法
test('测试返回结果为{success:true}',()=>{
  return fetchData().then((res)=>{
    expect(res.data).toEqual({
      success:true
    })
  })
  
})

test('测试返回结果为{success:true}',async()=>{
 const res = await fetchData()
    expect(res.data).toEqual({
      success:true
    })
  
})
test('测试返回结果为{success:true}',()=>{
  return expect(fetchData()).resolves.toMatchObject({
    data:{
      success: true
    }
  })
})
test('测试返回结果为{success:true}',async()=>{
  await expect(fetchData()).resolves.toMatchObject({
    data:{
      success: true
    }
  })
  
})
 //测试返回404
test('测试返回结果为 404',()=>{
  expect.assertions(1);//测试用例必须执行一次
  return fetchData().catch((e)=>{
    expect(e.toString().indexOf('404')!==-1).toBe(true)
  })
})
test('测试返回结果为 404',()=>{
  return  expect(fetchData()).rejects.toThrow()
})
```

#### jest 中的mock

> 当我们测试请求时，我们并不需要测试接口返回的数据，接口测试是属于后端的测试了，我们只关心，代码是否正常执行
> 而且如果都去请求，那么测试效率会很慢，这个时候我们就需要用mock来模拟ajax请求，不去请求真实的ajax

新建文件 demo.js

```js
import Axios from "axios"

export const runCallback  = function (callBack){
  callBack()
}
export const createObject  = function (callBack){
  new callBack()
}

export const getData = function(){
  return Axios.get('/api')
}
```

测试 demo.test.js

```js
import {runCallback,createObject,getData} from './demo'
import Axios from "axios"

jest.mock('axios') //模拟axios
//回调的异步函数
test('测试runCallback', ()=>{
 
  // 可以自由定义返回值
  const func = jest.fn(()=>{
    return '456'
  })
    // 上面等同提出来下面
  // func.mockImplementation(()=>{
  //   return '456'
  // })

  // 如果只想返回this
  // func.mockReturnThis()

  // func.mockReturnValueOnce('一次返回')
  // func.mockReturnValue('456') 定义返回值
  	runCallback(func)
 // 通过jest.fn 创建的mock函数，可以用toBeCallEd捕获这个函数是否被调用了
  expect(func).toBeCalled()
  // expect(func).toBeCalledWith('value') 每一次调用传入的都是value
  console.log(func.mock);
  /*打印的mock：
   {
      calls: [ [] ], //包含调用时，传递的参数，可以通过判断calls的length来判断调用了几次
      instances: [ undefined ],指func 运行时，this的指向
      invocationCallOrder: [ 1 ],调用的顺序
      results: [ { type: 'return', value: '456' } ] 执行调用的返回值
    }
  */
})
test('测试createObject',()=>{
  const fn = jest.fn()
  createObject(fn)
  console.log(fn.mock);
})

  // 模拟返回，不会去请求真实的数据
  // mockResolvedValueOnce
test('测试getData',async()=>{
  axios.get.mockResolvedValue({data:'data'})
  await getData().then((data)=>{
    expect(data).toEqual({data:'data'})
  })
})
```

我们除开上面的模拟axios的方式，我们还可以通过模拟异步函数，通过使用模拟的异步函数来达到不请求axios的效果

被测试文件 demo.js

```js
import Axios from "axios"

export const fetchData = function(){
  return Axios.get('/api')
}

export const getNumber = function(){
  return 123
}
```

在同级创建一个`_mocks_`文件夹

同样创建一个demo.js来模拟原demo.js 的异步请求

```js
export const fetchData = ()=>{
  return new Promise((resolved,reject)=>{
    resolved("(function(){return '123'})()")
  })
}
```

测试文件 demo.test.js

```js
jest.mock('./demo.js') 

import {fetchD} from './demo'
const {getData} = jest.requireActual('./demo.js') //引入真正的demo

test('测试异步fetchData',async()=>{
  return fetchD().then(data=>{
    console.log(data);
    expect(eval(data)).toEqual('123')
  })
})
test('测试同步getData',async()=>{
  expect(getData()).toBe(123)
})
//模拟后会去查找__mocks__下的demo.js,而非真实的的demo.js
// 或者直接将config.js中的automock 改成true 自动开启模拟
// unmok  不模拟
// 当我们开启模拟时，如果想让模拟文件中异步需要模拟，而同步不需要模拟就需要下面这样引入同步方法
```

#### 快照 snapshot

> 给代码生成一个副本，当代码有所变动，就去与副本中的代码对比，判断是否需要本次的修改，什么时候使用快照呢，当你的代码基本完善，无需修改时，就可以生成一个快照，以后出现代码修改，就可以通过快照的检测，知道那个文件发生了改动
>

测试文件 demo.js

```js
export const generateConfig= ()=>{
  return {
    sever:"localhost",
    port:8080,
    proxy:8081
  }
}
export const generateAnotherConfig= ()=>{
  return {
    sever:"localhost",
    port:8080,
    proxy:8082
  }
}

export const generateTimeConfig= ()=>{
  return {
    sever:"localhost",
    port:8080,
    proxy:8084,
    time:new Date()
  }
}
```

测试文件 demo.test.js

```js
import {
  generateConfig,
  generateAnotherConfig,
  generateTimeConfig
} from "./demo";

test("测试generateConfig 函数", () => {
  expect(generateConfig()).toMatchSnapshot();
});
//假设，测试一个配置文件，如果你修改了配置文件，如果使用的是toEqual（），
/*那么每次修改配置，都需要同步修改test，这样很麻烦，使用toMatchSnapshot()
(快照)， 会在根目录生成一个snapshots文件保存运行时，的测试的配置项代码，就
好像，拍了一个照片，之后就会和对比新快照，和旧快照是否一致，判断测试用例是否
通过， 
假设这时修改了配置
 1 snapshot failed from 1 test suite. Inspect your code changes or press `u` to update them.
 你只需打开w操作指令，按u表示，更新快照，就可以再次通过，
 类似于提示你，是否要确实这次修改
 
 当出现多个快照时，如果不想所有快照都更新，想一个一个确认更新，这个时候
 w 中会多出一个 i 模式，让你进入到一个一个确认下，这时再按u就表示确认更新快照
 如果感觉是错的，或者不确定，可以按s跳过该快照用例
 */
test("测试generateAnotherConfig 函数", () => {
  expect(generateAnotherConfig()).toMatchSnapshot();
});

// 当配置项中存在new Date() 这种动态变化的参数，就需要配置去忽略它，不然无法通过
test("测试generateTimeConfig 函数", () => {
  expect(generateTimeConfig()).toMatchSnapshot({
    time: expect.any(Date) //任意date类型都行
  });
});

//生成行内快照，下面的object就是运行后生成的快照
// 前置条件需要安装包cnpm i prettier@1.18.2 -D
// 行内快照 用toMatchInlineSnapshot不会单独生成一个文件，而是把快照直接
// 生成到函数内，
test("测试generateAnotherConfig 函数", () => {
  expect(generateAnotherConfig()).toMatchInlineSnapshot(`
    Object {
      "port": 8080,
      "proxy": 8082,
      "sever": "localhost",
    }
  `);
});
```

#### jest中的timer

> 当我们测试延时器等等时，不可能去等待时间再执行，这样测试效率会极低，所以jest提供了如下方式来快捷的测试timer
>

被测试文件 timer.js

```js
export const timer = (callback)=>{
  
 setTimeout(()=>{
    callback()
    setTimeout(()=>{
      callback()
    },3000)
  },3000);
}
```

测试文件 timer.test.js

```js
import {timer} from './timer'

beforeEach(()=>{
  
    jest.useFakeTimers(); //每个测试用例执行前，初始一下防止影响
  
})
test('测试定时器',()=>{
  const  fn = jest.fn()
  timer(fn);
  // jest.runAllTimers(); //让定时器立即执行，与上面的use配对使用
  // jest.runOnlyPendingTimers(); //只执行队列中存在的timer
  jest.advanceTimersByTime(3000)//快进定时器
  expect(fn).toHaveBeenCalledTimes(1) //fn只调用一次
  jest.advanceTimersByTime(3000) //快进是在上一个的基础上，存在多个测试用例时，可能会印象下面的，所以我们需要在运行之前重置一下
  expect(fn).toHaveBeenCalledTimes(2) 
})
```

#### jest中类的mock

新建模拟类的测试文件

util.js

```js
export default class Util{
  init(){
  }
  a(){
  }
  b(){
  }
}
```

新建文件 demo.js

```js
import Util from './util'
const demoFunction = (a,b)=>{
  const util = new Util();
  util.a(a)
  util.b(b)
}
export default demoFunction
```

测试文件 demo.test.js

```js
import demoFunction from './demo'
import Util from './util'

jest.mock('./util')
//jest.mock 发现uitl是一个类，会自动把类的构造函数和方法变成jest.fn()
/* 
  const Util= jest.fn()
  until.prototype.a = jest.fn()
  until.prototype.b = jest.fn()
  如果不满意默认处理，可以自定义在文件__mock__下util.js自行模拟
  如果不是很复杂可以直接传递第二个参数,就会执行第二个参数的代码
  jest.mock('./util'，()=>{
     const Util= jest.fn()
  Util.prototype..a = jest.fn()
  Util.prototype..b = jest.fn() 
  return Util
  })
*/

// 这里测试的关注点是是否有执行，如果类里a b 方法很复杂就会很耗性能，而他们执行的结果并非所关心的，所以用mock模拟
test('测试 demoFunction',()=>{
  demoFunction()
  expect(Util).toHaveBeenCalled() //是否执行过
  expect(Util.mock.instances[0].a).toHaveBeenCalled()
  expect(Util.mock.instances[0].b).toHaveBeenCalled()
})
```
