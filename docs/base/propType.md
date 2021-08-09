# propType

```js
当前class名.propTypes = {
  父组件传递过来的属性1: PropTypes.number,
  父组件传递过来的属性2: PropTypes.func, //类型为函数
  父组件传递过来的属性3: PropTypes.oneOfType([ 
    PropTypes.number,  PropTypes.string 
  ]), //类型既可以为数字，又可以为字符串
  父组件传递过来的属性4: PropTypes.string.isRequired //必须传递一个字符串
  
}

当前class名.defaultProps = {
  父组件传递过来的属性4: '我是默认值' //父组件就算不传值，且子组件又必须接收，就可以设默认值
}
```

