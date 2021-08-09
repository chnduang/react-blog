## 6 个提高 React 代码质量的方法 - 让你的 React 代码更简洁

> [https://mp.weixin.qq.com/s/Ovv21kiVhZHcz4US2KdkVQ](https://mp.weixin.qq.com/s/Ovv21kiVhZHcz4US2KdkVQ)

### **1. 条件渲染（一个条件时）**

当你要根据条件来判断，以渲染不同的组件时，比如条件满足（为 true) 时，就渲染组件，否则不渲染（渲染空内容），这种情况下
不要用三元运算符，而是要用 `&&` 这个操作符来处理，看下面的例子：

***\*不好的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const ConditionalRenderingWhenTrueBad = () => {  const [showConditionalText, setShowConditionalText] = useState(false)
  const handleClick = () =>    setShowConditionalText(showConditionalText => !showConditionalText)
  return (    <div>      <button onClick={handleClick}>Toggle the text</button>      {showConditionalText ? <p>The condition must be true!</p> : null}    </div>  )}
```

***\*改进后的代码\**：**



- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const ConditionalRenderingWhenTrueGood = () => {  const [showConditionalText, setShowConditionalText] = useState(false)
  const handleClick = () =>    setShowConditionalText(showConditionalText => !showConditionalText)
  return (    <div>      <button onClick={handleClick}>Toggle the text</button>      {showConditionalText && <p>The condition must be true!</p>}    </div>  )}
```

### **2. 条件渲染（不同的条件时）**

跟上面的情况有点像，也是根据条件来判断渲染的组件，只是条件不满足时不再渲染空内容，而是渲染别的组件内容。

这个时候应该用三元运算符。

***\*不好的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const ConditionalRenderingBad = () => {  const [showConditionOneText, setShowConditionOneText] = useState(false)
  const handleClick = () =>    setShowConditionOneText(showConditionOneText => !showConditionOneText)
  return (    <div>      <button onClick={handleClick}>Toggle the text</button>      {showConditionOneText && <p>The condition must be true!</p>}      {!showConditionOneText && <p>The condition must be false!</p>}    </div>  )}
```

***\*改进后的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const ConditionalRenderingGood = () => {  const [showConditionOneText, setShowConditionOneText] = useState(false)
  const handleClick = () =>    setShowConditionOneText(showConditionOneText => !showConditionOneText)
  return (    <div>      <button onClick={handleClick}>Toggle the text</button>      {showConditionOneText ? (        <p>The condition must be true!</p>      ) : (        <p>The condition must be false!</p>      )}    </div>  )}
```

### **3. 布尔值属性**

我们经常会传一个布尔类型的属性 (props) 给组件，类似 `myTruthyProp={true}` 这样的写法是没有必要的。

**不好的代码**：

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const HungryMessage = ({ isHungry }) => (  <span>{isHungry ? 'I am hungry' : 'I am full'}</span>)
export const BooleanPropBad = () => (  <div>    <span>      <b>This person is hungry: </b>    </span>    <HungryMessage isHungry={true} />    <br />    <span>      <b>This person is full: </b>    </span>    <HungryMessage isHungry={false} />  </div>)
```

***\*改进后的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const HungryMessage = ({ isHungry }) => (  <span>{isHungry ? 'I am hungry' : 'I am full'}</span>)
export const BooleanPropGood = () => (  <div>    <span>      <b>This person is hungry: </b>    </span>    <HungryMessage isHungry />    <br />    <span>      <b>This person is full: </b>    </span>    <HungryMessage isHungry={false} />  </div>)
```

这样更简洁点，虽然只是一个小小技巧，但是可以从中看出你是不是一个有经验且优秀的程序员。

### **4. 字符串属性**

跟上面的例子差不多，只是换成了字符串类型，这个时候，我们通常用双引号把字符串括起来，再加上花括号，如下面这样：

**不好的代码**：

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const Greeting = ({ personName }) => <p>Hi, {personName}!</p>
export const StringPropValuesBad = () => (  <div>    <Greeting personName={"John"} />    <Greeting personName={'Matt'} />    <Greeting personName={`Paul`} />  </div>)
```

***\**\*改进后的代码\*\*：\****

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const Greeting = ({ personName }) => <p>Hi, {personName}!</p>
export const StringPropValuesGood = () => (  <div>    <Greeting personName="John" />    <Greeting personName="Matt" />    <Greeting personName="Paul" />  </div>)
```



### **5. 事件绑定函数**

我们经常会给一个组件绑定类似 `onClick` 或 `onChange` 这样的事件，比如我们可能会这样写：`onChange={e => handleChange(e)}`，其实是没必要的，且看：

***\*不好的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const UnnecessaryAnonymousFunctionsBad = () => {  const [inputValue, setInputValue] = useState('')
  const handleChange = e => {    setInputValue(e.target.value)  }
  return (    <>      <label htmlFor="name">Name: </label>      <input id="name" value={inputValue} onChange={e => handleChange(e)} />    </>  )}
```

***\*改进后的代码\**：**



- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React, { useState } from 'react'
export const UnnecessaryAnonymousFunctionsGood = () => {  const [inputValue, setInputValue] = useState('')
  const handleChange = e => {    setInputValue(e.target.value)  }
  return (    <>      <label htmlFor="name">Name: </label>      <input id="name" value={inputValue} onChange={handleChange} />    </>  )}
```

### **6. 组件属性**

跟上面的例子差不多，我们也可以把组件作为属性传给别的组件，这个时候，支持使用把组件包成函数来传递，但没有接任何参数的时候，这种是没有必要的，且看：

***\*不好的代码\**：**

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const CircleIcon = () => (  <svg height="100" width="100">    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />  </svg>)
const ComponentThatAcceptsAnIcon = ({ IconComponent }) => (  <div>    <p>Below is the icon component prop I was given:</p>    <IconComponent />  </div>)
export const UnnecessaryAnonymousFunctionComponentsBad = () => (  <ComponentThatAcceptsAnIcon IconComponent={() => <CircleIcon />} />)
```

***\**\*改进后的代码\*\*：\****

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 

```
import React from 'react'
const CircleIcon = () => (  <svg height="100" width="100">    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />  </svg>)
const ComponentThatAcceptsAnIcon = ({ IconComponent }) => (  <div>    <p>Below is the icon component prop I was given:</p>    <IconComponent />  </div>)
export const UnnecessaryAnonymousFunctionComponentsGood = () => (  <ComponentThatAcceptsAnIcon IconComponent={CircleIcon} />)
```

- 