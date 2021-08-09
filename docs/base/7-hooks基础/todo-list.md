## 使用Hooks实现的TodoList

### 拆分组件

+ 将其划分为三个模块


+ 所有的组件我就只在一个js文件中写的

+ 以下是全部的代码

+ 具体说明，我在注释中解释

```js
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import './App.css'

/**
 * App: 最外层组件，是入口
 * TodoInput: 输入框
 * TodoList: 下面的数据显示，最外层
 * TodoListItem: 每条数据
*/
let time = Date.now();
const Local_key = '_todo_';
const TodoInput = memo((props) => {
  console.log(props);
  const { addTodo } = props;
  // 用来获取输入框里的值
  const textValue = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();
    const newValue = textValue.current.value.trim();
    if (!newValue.length) {
      return;
    }
    addTodo({
      id: ++time,
      content: newValue,
      complete: false,
    });
    textValue.current.value = '';
  }

  return (
    <div className="input-list">
      <h1>todo-list</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          ref={textValue}
          placeholder="input todo list"
          className="input-value"
        />
      </form>
    </div>
  )
});

const TodoList = memo((props) => {
  console.log(props);
  const { todos, changeTodo, removeTodo } = props;
  return (
    <div className="content-list">
      <ul>
        {
          todos.map((item) => {
            return (
              <TodoListItem 
                key={item.id}
                changeTodo={changeTodo}
                removeTodo={removeTodo}
                todo={item}
              />
            )
          })
        }
      </ul>
    </div>
  )
});

const TodoListItem = memo((props) => {
  const { todo:{ id, complete, content }, changeTodo, removeTodo } = props;
  const handleOnChange = () => {
    changeTodo(id);
  }
  const handleRemove = () => {
    removeTodo(id)
  }
  return (
    <li className="todo-item">
      <input
        type="checkbox"
        onChange={handleOnChange}
        checked={complete}
      />
      <label className={complete ? 'complete': ''}>{content}</label>
      <button onClick={handleRemove}>移除</button>
    </li>
  )
});

//入口
const App = () => {
  const [todos, setTodo] = useState([]);
// 增加事项
  const addTodo = useCallback((todo) => {
    setTodo(todos => [...todos, todo]);
  }, []);
// 移除事项
  const removeTodo = useCallback((id) => {
    setTodo(todos => todos.filter(item => {
      return item.id !== id
    }));
  }, []);
// 改变状态
  const changeTodo = useCallback((id) => {
    setTodo(todos => todos.map(todo => {
      return todo.id === id 
          ? {
              ...todo,
              complete: !todo.complete
            }
          : todo
    }));
  }, []);
// 使用localStorage存储数据,让下次打开保留上一次的数据
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(Local_key));
    setTodo(data);
  }, [])
  useEffect(() => {
    localStorage.setItem(Local_key, JSON.stringify(todos));
  }, [todos])

  return (
    <div className="todo-list">
      <TodoInput addTodo={addTodo} />
      <TodoList
        removeTodo={removeTodo}
        changeTodo={changeTodo}
        todos={todos}
      />
    </div>
  )
}
export default App;

```

