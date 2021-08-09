### 基础用法

```jsx
import { observer, useLocalStore } from 'mobx-react';  
const Hooks = observer(() => {  
 const todo = useLocalStore(() =>  ({  
   title: 'Click to toggle', done: false,  toggle() {  
    todo.done = !todo.done  
    },  
   get emoji() {  
     return todo.done ? '😜' : '🏃'  
   },
   })
 );  
  
 return <div onClick={todo.toggle}>  
    <h3>{todo.title} {todo.emoji}</h3>  
 </div>  
})
```

1

```jsx
import { useLocalStore, useObserver } from 'mobx-react';  
function Person() {  
 const person = useLocalStore(() => ({ name: 'John' }))  
 return useObserver(() => (  
 <div>  
    {person.name}  
    <button onClick={() => (person.name = 'Mike')}>No! I am Mike</button>  
 </div>  
 ))}  
```

2.使用 `useObserver(()=>JSX.Element)` 方法取代 `observer(()=>JSX.Element)`

```jsx
import { Observer, useLocalStore } from 'mobx-react';  
function ObservePerson() {  
 const person = useLocalStore(() => ({ name: 'John' }))  
 return (  
 <div>  
    {person.name} <i>I will never change my name</i>  
    <div>  
        <Observer>{() => <div>{person.name}</div>}</Observer>  
        <button onClick={() => (person.name = 'Mike')}>  
 I want to be Mike  </button>  
    </div>  
 </div>  
 )}
```

使用部分渲染, 只有被`<Observer></Observer>`包裹的才能监听到对应值的改变

### 优化、分离、传值

```jsx
import React, { FC } from 'react';import { observer, useLocalStore } from 'mobx-react';  
function initialFn(source) {  
 return ({  
 count: 2, get multiplied() {  
 return source.multiplier * this.count  
  },  
  inc() {  
 this.count += 1  },  
  });  
}  
  
const Counter: FC<{ multiplier: number }> = observer(props => {  
  
 const store = useLocalStore(  
  initialFn,  
 Object.assign({ a: 1 }, props),// 可以传任意值  
  );  
  
 return (  
 <div>  
    <button id="inc" onClick={store.inc}>  
    {`Count: ${store.count}`}  
    </button>  
    <span>{store.multiplied}</span>  
 </div>  
 )})  
```

