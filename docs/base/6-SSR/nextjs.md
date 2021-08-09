## Nextjs

### 关于Nextjs的介绍

>  Next.js 是一个轻量级的 React 服务端渲染应用框架。有了它我们可以简单轻松的实现React的服务端渲染，从而加快首屏打开速度，也可以作SEO（收索引擎优化了）。在没有Next.js的时候，用React开发需要配置很多繁琐的参数，如Webpack配置，Router配置和服务器端配置等....。如果需要作SEO，要考虑的事情就更多了，怎么样服务端渲染和客户端渲染保持一致就是一件非常麻烦的事情，需要引入很多第三方库。但有了Next.js，这些问题都解决了，使开发人员可以将精力放在业务逻辑上，从繁琐的配置中解放出来 

### Nextjs的优点

- 完善的React项目架构，搭建轻松。比如：Webpack配置，服务器启动，路由配置，缓存能力，这些在它内部已经完善的为我们搭建完成了。
- 自带数据同步策略，解决服务端渲染最大难点。把服务端渲染好的数据，拿到客户端重用，这个在没有框架的时候，是非常复杂和困难的。有了Next.js，它为我们提供了非常好的解决方法，让我们轻松的就可以实现这些步骤。
- 丰富的插件帮开发人员增加各种功能。每个项目的需求都是不一样的，包罗万象。无所不有，它为我们提供了插件机制，让我们可以在使用的时候按需使用。你也可以自己写一个插件，让别人来使用。
- 灵活的配置，让开发变的更简单。它提供很多灵活的配置项，可以根据项目要求的不同快速灵活的进行配置
- 目前Next.js是React服务端渲染的最佳解决方案，所以如果你想使用React来开发需要SEO的应用，基本上就要使用Next.js

### 脚手架构建Nextjs的项目

>  `create-next-app`可以快速的创建`Next.js`项目；简单来说它就是一个脚手架

+ 有三种方式可以通过`create-next-app`进行`nextjs`的项目构建

  + ```bash
    npx create-next-app my-next-app
    ```
	
    + 不是版本很低nodejs,都会有npx这个模块；
    
    + ```bash
    // 在自己的命令行中输入查看版本号
      npx -v
      // 如果没有可以使用npm进行安装
      npm install -g npx
      ```
    
  + ```bash
  yarn create next-app my-next-app
    ```
  
  + ```bash
    // 先全局安装create-next-app的脚手架工具
    npm install -g create-next-app
    //使用create-next-app 构建
    create-next-app my-next-app
    ```
  
  + 全部安装后可以看到命令行的命令提示;cd到项目的目录中然后输入命令
  
    ```bash
    yarn dev
    //默认端口是locahost:3000; 如果端口号被占用可自行修改端口号
    ```
  
+ 修改端口号

  + 进入到项目根目录下的`package.json`
  + 进去之后主要看`script`中的命令
  + 修改dev和start端口都是在其后面加` -p 端口`即可

  ```json
  {
    "scripts": {
      "dev": "next dev -p 8999",
      "build": "next build",
      "start": "next start -p 8999"
    },
  }
  ```


### 路由配置

> nextjs脚手架生成的项目中pages文件夹下的文件/文件夹，运行时会被转成路由，
>
> 也就是说，当我们想要创建/list路由时，只需要创建一个list.js即可，或者创建文件夹，下建立index.js，nextjs会帮我们自动编译成路由
>
> 这个和nuxtjs相同，为我们节省了路由的配置，只需要关注我们的具体需求即可

#### 路由跳转

##### 标签式导航

> 使用Link
>
> 同路由跳转一样给我们想要跳转的套上Link标签和a标签即可

+ 比如在index.js页面中，

+ 首先我们需要先引入Link

  ```js
  import Link from 'next/link'
  ```

+ 这里模拟跳转首页

+ 要跳转其他路由，只需要在href中写对应的路由即可

  ```js
  return (
   <div>
   	<Link href="/">
   	  <a>首页</a>
   	</Link>
   </div>
  )
  ```

+ 注意: 当我们想要在Link标签中嵌套两个跳转时，需要用一个父标签将他们包裹起来如a标签;它不支持兄弟标签并列的情况

  ```js
  <a>
    <span>1</span>
    <span>2</span>
  </a>
  ```

+ 如果不包裹就会出现报错，如下

  ```js
  client pings, but there's no entry for page: /_error
  Warning: You're using a string directly inside <Link>. This usage has been deprecated. Please add an <a> tag as child of <Link>
  ```

##### 标签式导航跳转传参

+ 当然也可以直接在跳转路径上的拼接参数即可

  ```js
  <Link href={{pathname:'/',query:{name:'demo',id:1}}}>
      <a>传参</a>
  </Link>
  ```

##### 编程式导航

> 使用Router模块进行跳转

+ 引入Router

  ```js
  import Router from 'next/router'
  ```

+ 这里为了简单演示，就直接在jsx中写了

  ```jsx
  <div>
     <button onClick={()=>{Router.push('/')}}>首页</button>
  </div>
  ```

##### 编程式导航传参

+ d

  ```jsx
      Router.push({
        pathname:'/',
        query:{
          name:'demo',
          id: 1
        }
      })
  ```

##### 接收传过来的参数

+  `withRouter`是Next.js框架的高级组件，用来处理路由用的 

+ 这里可以使用，拿取路由中的参数

  ```js
  import { withRouter} from 'next/router'
  import Link from 'next/link'
  
  const Demo = ({router})=>{
      return (
          <>
              <div>{router.query.name}</div>
              <Link href="/"><a>返回首页</a></Link>
          </>
      )
  }
  
  export default withRouter(Demo)
  ```

### 路由钩子事件

>  在监听路由发生变化时，我们需要用Router组件，然后用`on`方法来进行监听 

##### `routerChangeStart`路由发生变化时

```js
   Router.events.on('routeChangeStart',(...args)=>{
    console.log('routeChangeStart->路由开始变化,参数为:',...args)
  })
```

##### `routerChangeComplete`路由结束变化时

```js
  Router.events.on('routeChangeComplete',(...args)=>{
    console.log('routeChangeComplete->路由结束变化,参数为:',...args)
  })
```

##### `beforeHistoryChange`浏览器history触发前

```js
  Router.events.on('beforeHistoryChange',(...args)=>{
    console.log('beforeHistoryChange->在改变浏览器 history之前触发,参数为:',...args)
  })
```

##### `routeChangeError`路由跳转发生错误时

```js
 Router.events.on('routeChangeError',(...args)=>{
    console.log('routeChangeError->跳转发生错误,参数为:',...args)
  })
```

#### hash路由模式

还有两种事件，都是针对hash的，所以现在要转变成hash模式。hash模式下的两个事件`hashChangeStart`和`hashChangeComplete`

##### `hashChangeStart`hash跳转开始时执行

```js
  Router.events.on('hashChangeStart',(...args)=>{
    console.log('hashChangeStart->hash跳转开始时执行,参数为:',...args)
  })
```

##### `hashChangeComplete`hash跳转完成时

```js
  Router.events.on('hashChangeComplete',(...args)=>{
    console.log('hashChangeComplete->hash跳转完成时,参数为:',...args)
  })
```

### 组件使用

> 当我们想自定义组件的使用的时候，我们可以在components文件夹下创建我们想要的组件
>
> 直接新建js文件或者新建文件夹在其下创建文件
>
> 使用的时候只需直接引入即可，和在react中使用一样，只不过这里是规范组件的定义规范

### `getInitialProps`

>  在`Next.js`框架中提供了`getInitialProps`静态方法用来获取远端数据，这个是框架的约定，所以你也只能在这个方法里获取远端数据 
>

##### 使用axios发送请求获取数据

> 从props中解构{router,data}
>
> data即为请求到的数据

```js
import { withRouter} from 'next/router'
import Link from 'next/link'
import axios from 'axios'

const Demo = ({router,data})=>{
    return (
        <>
            <div>{router.query.name}{data}</div>
        </>
    )
}

Demo.getInitialProps = async ()=>{
    const promise =new Promise((resolve)=>{
            axios('https://').then(
                (res)=>{
                    console.log('数据：',res)
                    resolve(res.data.data)
                }
            )
    })
    return await promise
}

export default withRouter(Demo)
```

### 懒加载自定义组件

##### 使用dynamic对自定义组件进行组件的懒加载

+ 引入dynamic

```js
import dynamic from 'next/dynamic'
```

+ 使用

  ```js
  import React, {useState} from 'react'
  import dynamic from 'next/dynamic'
  
  const Demo = dynamic(import('../components/demo'))
  
  function DemoCom(){
      return (
          <div>
              <Demo/>
          </div>
      )
  }
  export default DemoCom;
  ```

+ 可以自定义组件就是懒加载的，只有在`jsx`里用到时，才会被加载进来，如果不使用就不会被加载。 

### 让nextjs支持css

> `Next.js`默认是不支持CSS文件的，它用的是`style jsx`，
>
> 也就是说它是不支持直接用`import`进行引入`css`的。 
>
> 如果引入会报错

#####  https://github.com/zeit/next-plugins 

> 这里有next的插件，有很多可自行查看

##### 安装`@zeit/next-css`

> 它的主要功能就是让`Next.js`可以加载CSS文件，有了这个包才可以进行配置。 

+ 安装

  ```bash
  yarn add @zeit/next-css
  ```

+ 先创建`next.config.js`然后在其中进行配置，

  ```js
  const withCss = require('@zeit/next-css')
  if(typeof require !== 'undefined'){
      require.extensions['.css']=file=>{}
  }
  module.exports = withCss({})
  ```

### 配置按需加载第三方组件库

#### 以antd为示例

+ 安装

```bash
yarn add antd
```

##### 安装和配置`babel-plugin-import` 插件 

###### 安装

```bash
yarn add babel-plugin-import
```

###### 在项目根目录建立`.babelrc`文件，进行配置

> 完成后要重新打包编译才可生效

```js
{
    "presets":["next/babel"],  //Next.js的总配置文件，相当于继承了它本身的所有配置
    "plugins":[     //增加新的插件，这个插件就是让antd可以按需引入，包括CSS
        [
            "import",
            {
                "libraryName":"antd",
                "style":"css"
            }
        ]
    ]
}
```

### 配置APP入口

> 在page目录下，新建一个`_app.js`文件，然后写入下面的代码。 
>
> 就可以全局引入antd的样式了

```js
import App from 'next/app'
import 'antd/dist/antd.css'

export default App
```

