## Eggjs-Nextjs

### 先使用Nextjs的脚手架搭建整体架构

+ 这里使用

  ```bash
  npx create-next-app my-next-app
  ```

### 安装egg.js

+  我们先进入到项目的根文件夹中(与创建的package.json同级)，然后在根文件夹下，建立一个`service`的文件夹，这就是中台的文件夹了。 

+  推荐直接使用脚手架，只需几条简单指令，即可快速生成项目（`npm >=6.1.0`）

+ cd到根目录下的`service`目录，在下面输入命令

  ```bash
  npm init egg --type=simple
  ```

+ 初始化后需要安装包

  ```bash
  npm install
  ```

+  安装后即可启动服务，注意是在`service`目录下

   ```bash
   npm run dev
   ```

### 路由配置

> 与koa的路由配置基本相同

+ 让egg为前端提供Api接口，实现中台主要的功能 ；这里使用`restful-api`接口设计

+ 在controller控制器中，eggjs默认给我们一个示例home.js

  +  创建eggjs的项目之后都会有home.js
  +  在controller中写我们逻辑代码可以写service

  ```js
  'use strict';
  
  const Controller = require('egg').Controller;
  
  class HomeController extends Controller {
    async index() {
      const { ctx } = this;
      ctx.body = 'hi, egg';
    }
  }
  module.exports = HomeController;
  
  ```

+  在router.js中配置路由

   +  也是框架提供给我们的

   ```js
   'use strict';
   
   /**
    * @param {Egg.Application} app - egg application
    */
   module.exports = app => {
     const { router, controller } = app;
     router.get('/', controller.home.index);
   };
   
   ```

+  可以看出：框架在加载router.js中路由，会去找controller下对应的找对应的文件夹/文件，找问价中对应的方法；当然配置路由时需要指定每个路由对应的方法

+  可以启动egg服务后通过修改`ctx.body`的值可以看到不同的返回值，那个即是我们在访问接口的时候的返回值

+  为了让`router.js`只是为了暴露配置，在app文件夹下面创建router文件夹

   ```bash
   ├─controller
   │  ├─client
   │  └─server
   ├─public
   └─router
   │  ├─client.js
   │  └─server.js
    ─router.js
   ```

   +  可在`router/client.js`中配置访问的路由

      ```js
      'use strict';
      /**
       * @param {Egg.Application} app - egg application
       */
      module.exports = app => {
        const { router, controller } = app;
        router.get('/client/getList', controller.client.home.getArticleList);
      }
      
      //这里请求方式和我们正常的请求一样，像get/put/post/delete
      ```

   +  在router.js中引入

      ```js
      'use strict';
      
      const client = require('./router/client');
      /**
       * @param {Egg.Application} app - egg application
       */
      module.exports = app => {
        const { router, controller } = app;
        client(app);
      };
      ```

   +  在controller也是一样创建client/home.js；只需在其写方法即可;

### 连接数据库

> 这里是使用mysql数据库
>
> 使用egg-mysql插件

+ 如果eggjs是npm/i创建的那么最好使用npm安装插件，使用yarn可能会导致安装失败以及其他原因，这里使用npm进行安装

  ```bash
  npm i egg-mysql --save
  ```

+ 和我们之前不一样的是，安装后不能直接使用，需要配置插件

  + 插件配置config下面的plugin.js以及config.default.js两者都需要配置
  + config/plugin.js
    + 如果有要安装其他的egg-plugin插件都要在这里进行配置

  ```js
  'use strict';
  
  //这里是框架提供的，可以直接注释掉
  /** @type Egg.EggPlugin */
  // module.exports = {
  //   // had enabled by egg
  //   // static: {
  //   //   enable: true,
  //   // }
  // };
  
  // 配置插件
  exports.mysql = {
    enable: true,
    package: 'egg-mysql',
  };
  ```

  + config/config.default.js

    + 在其本身基础上增加对象config的属性即可
    + 里面的keys最好先不要动，不然会引起报错
  
    ```js
    /* eslint valid-jsdoc: "off" */
    'use strict';
    /**
     * @param {Egg.EggAppInfo} appInfo app info
     */
    module.exports = appInfo => {
      /**
       * built-in config
       * @type {Egg.EggAppConfig}
       **/
      const config = exports = {};
      // use for cookie sign key, should change to your own and keep security
      config.keys = appInfo.name + '_1572838718244_4569';
      // add your middleware config here
      config.middleware = [];
      // add your user config here
      const userConfig = {
        // myAppName: 'egg',
      };
      config.mysql = {
        // database configuration
        client: {
          // host
          host: 'localhost',
          // port
          port: '3306',
          // username
          user: 'root',
          // password
          password: 'qd1224',
          // database
          database: 'blog_demo',
        },
        // load into app, default is open
        app: true,
        // load into agent, default is close
        agent: false,
      };
      return {
        ...config,
        ...userConfig,
      };
    };
    ```
  
    + 可在egg-mysql找到其配置   https://github.com/eggjs/egg-mysql 
    + 根据自己的数据库配置进行修改即可
  
    ```js
      config.mysql = {
        // database configuration
        client: {
          // host
          host: 'localhost',
          // port
          port: '3306',
          // username
          user: 'root',
          // password
          password: 'qd1224',
          // 数据库名称
          database: 'blog_demo',
        },
        // load into app, default is open
        app: true,
        // load into agent, default is close
        agent: false,
      };
    ```
#### 创建基本数据

+ 在数据库创建一个表，随意设计一个表录入一条数据

+ 到controller中写接口以及返回值，记得配置对应的路由

  ```js
  // 使用get请求
  router.get('/client/index', controller.client.home.index);
  ```

  ```js
  'use strict';
  const Controller = require('egg').Controller;
  
  class HomeController extends Controller {  
  	async index() {
          //从全局this中结构出上下文的 ctx
      	const { ctx } = this;
          //数据库查询命令可以在egg-mysql/github中查，这里是查询 表blog_title的全部数据
      	const result = await this.app.mysql.select('blog_title', {});
          //可打印返回值，这是启动的命令行那里，不在浏览器中
      	// console.log(result);
          //返回的值
      	ctx.body = result;
    	}
  }
  ```

+ 在浏览器中输入对应的路由，如果看到返回的json数据即可

### 接口拿取数据

+ 进入项目的根目录下面，注意是最外层的package.json同级目录

+ 安装axios

  ```bash
  yarn add axios
  ```

+ 在写请求之前我们可以先进行接口地址的配置，将其放在一个文件中去

+ 这里在根目录下创建config文件夹，在下面创建url.js的文件专门用来放地址

  ```js
  const baseUrl = 'http://127.0.0.1:7001/client/'
  
  const urlPath = {
    getIndex: `${baseUrl}index`,
  }
  
  export default urlPath
  ```

+ 在pages下的index.js中开始写请求

  + 这里使用hooks写
  + 这里使用getInitialProps在其中写异步请求并且返回值
  + 接收props参数，这个参数可以打印出来，可以看到有data属性其中就是接口的返回值，
  + 拿到的值可以赋值给myList（自定义参数）就可以在jsx中循环生成数据了

  ```js
  import React, { Fragment, useState, useEffect } from 'react'
  import Head from 'next/head'
  import axios from 'axios'
  
  import urlPath from '../config/url'
  
  const { getIndex: getList } = urlPath;
  
  const Home = (props) => {
    const list = props.data
    const [myList, setMyList ] = useState(list)
  
    return (
      <Fragment>
        <Head>
          <title>Home</title>
        </Head>
        <ul>
        	{myList.map(item => {
           	return (<li>item.title</li>)
          })}
        </ul>
     </Fragment>
    )
  }
  
  Home.getInitialProps = async () => {
    const promiseList = new Promise((resolve) => {
      axios.get(getList).then((res) => {
        resolve(res.data)
      })
    })
    return await promiseList, 
  }
  
  export default Home
  
  ```

### 解决跨域问题

+ 请求数据时会出现跨域的报错，虽然我们是都在本地，在端口不同而会导致跨域问题

+ 安装egg-cors

  ```bash
  npm install --save egg-cors
  ```

+ 配置插件 (和数据库插件一样需要进行配置)

  + plugin.js

    ```bash
    exports.cors = {
      enable: true,
      package: 'egg-cors',
    };
    ```

  + config.default.js

    ```js
     // egg-cors 解决跨域
      config.security = {
        csrf: { enable: false },
        domainWhiteList: [ '*' ],
      };
      config.cors = {
        origin: 'http://localhost:3000', // 只允许这个域进行访问接口
        credentials: true, // 开启认证
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
      };
    ```

  + 在两个文件加入配置即可解决跨域请求了

### 小结：

基本的流程就是这些，其他的也就是业务逻辑不同导致的接口以及数据不同而已，都是按照这样来从数据库拿数据，接口返回值，页面请求数据，页面显示数据

