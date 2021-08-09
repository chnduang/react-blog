## Egg.js

### 简介

**Egg.js 为企业级框架和应用而生**，帮助开发团队和开发人员降低开发和维护成本。

专注于提供 Web 开发的核心功能和一套灵活可扩展的插件机制，不会做出技术选型，因为固定的技术选型会使框架的扩展性变差，无法满足各种定制需求。

Egg 的插件机制有很高的可扩展性，**一个插件只做一件事**，Egg 通过框架聚合这些插件，并根据自己的业务场景定制配置，这样应用的开发成本就变得很低。

Egg 奉行『**约定优于配置**』，按照[一套统一的约定](https://eggjs.org/zh-cn/advanced/loader.html)进行应用开发，Egg 有很高的扩展性，可以按照团队的约定定制框架。使用 [Loader](https://eggjs.org/zh-cn/advanced/loader.html) 可以让框架根据不同环境定义默认配置，还可以覆盖 Egg 的默认约定。

### 特性

- 提供基于 Egg [定制上层框架](https://eggjs.org/zh-cn/advanced/framework.html)的能力
- 高度可扩展的[插件机制](https://eggjs.org/zh-cn/basics/plugin.html)
- 内置[多进程管理](https://eggjs.org/zh-cn/advanced/cluster-client.html)
- 基于 [Koa](http://koajs.com/) 开发，性能优异
- 框架稳定，测试覆盖率高
- [渐进式开发](https://eggjs.org/zh-cn/tutorials/progressive.html)(根据设备的支持情况来提供更多功能，提供离线能力，推送通知，甚至原生应用的外观和速度，以及对资源进行本地缓存。)

### Egg和koa

> 如上述，Koa 是一个非常优秀的框架，然而对于企业级应用来说，它还比较基础。
>
> 而 Egg 选择了 Koa 作为其基础框架，在它的模型基础上，进一步对它进行了一些增强。
>
> Eggjs的官网网站有很详细的文档 https://eggjs.org/zh-cn/intro/index.html 

+ 在 Express 和 Koa 中，经常会引入许许多多的中间件来提供各种各样的功能，而 Egg 提供了一个更加强大的插件机制，让这些独立领域的功能模块可以更加容易编写。
  + extend：扩展基础对象的上下文，提供各种工具类、属性。
  + middleware：增加一个或多个中间件，提供请求的前置、后置处理逻辑。
  + config：配置各个环境下插件自身的默认配置项。
  + 一个独立领域下的插件实现，可以在代码维护性非常高的情况下实现非常完善的功能，而插件也支持配置各个环境下的默认（最佳）配置，让我们使用插件的时候几乎可以不需要修改配置项。

### 快速搭建环境

+ 运行环境

  + 建议选择Node.js稳定版本，最低要求 8.x

+ 初始化项目

  + ```bash
    npm init egg --type=simple   //--type=simple可以去掉然后自己配置
    cd demo
    npm install
    ```

+ 启动项目

  + ```bash
    npm run dev
    浏览器打开：localhost:7001
    ```

**注意：实际项目中，推荐使用脚手架直接初始化，所以这里不做手动初始化项目了。**

+ 如果了解java的可以看出eggjs的项目目录结构以及处理请求的模式和javaweb很像，controller,service,view；不陌生的是都是MVCde 开发模式，不同就是如何拿数据给请求者

+ 项目目录

  + ```txt
    app文件夹:
    	项目开发文件，程序员主要操作的文件，项目的大部分代码都会写在这里。
    config文件夹：
    	这个是整个项目的配置目录，项目和服务端的配置都在这里边进行设置。
    logs文件夹：
    	日志文件夹，正常情况下不用修改和查看里边内容。
    node_modules:
    	项目所需要的模块文件，这个前端应该都非常了解，不多作介绍。
    run文件夹：
    	运行项目时，生成的配置文件，基本不修改里边的文件。
    test文件夹：
    	测试使用的配合文件，这个在测试时会使用。
    .autod.conf.js: 
    	egg.js自己生成的配置文件，不需要进行修改。
    eslinttrc和eslintignore：
    	代码格式化的配置文件。
    gitgnore：
    	git设置忽略管理的配置文件。
    package.json：
    	包管理和命令配置文件，这个文件经常进行配置。
    ```
    
  + app目录中
  
    ```txt
    controller文件夹：
    	控制器，渲染和简单的业务逻辑都会写道这个文件里。配置路由时也会用到（路由配置需要的文件都要写在控制器里）。
    public文件夹：
    	公用文件夹，把一些公用资源都放在这个文件夹下。
    router.js: 
    	项目的路由配置文件，当用户访问服务的时候，在没有中间件的情况下，会先访问router.js文件。
    service文件夹：
    	这个是当我们的业务逻辑比较复杂或和数据库打交道时，会把业务逻辑放到这个文件中。
    view文件夹：
    	模板文件夹，相当于表现层的专属文件夹，这个项目，我们使用接口的形式，所以不需要建立view文件夹。
    extend文件：
    	当我们需要写一些模板中使用的扩展方法时，我们会放到这个文件夹里。
    middleware：
    	中间件文件夹，用来写中间件的，比如最常用的路由首位。
    ```

#### 扩展插件

在基于 Egg 的框架或者应用中，我们可以通过定义 `app/extend/{application,context,request,response}.js`
这里表示可以创建application,context,request,response四个js文件

来扩展 Koa 中对应的四个对象的原型，通过这个功能，我们可以快速的增加更多的辅助方法，例如我们在 `app/extend/context.js` 中写入下列代码：

```
// ./app/extend/context.js
module.exports = {
  get isIOS() {//get表示通过这个isIOS得到什么记得添加
    const iosReg = /iphone|ipad|ipod/i;//正则
    return iosReg.test(this.get('user-agent'));
      //User Agent显示使用的浏览器类型及版本、操作系统及版本、浏览器内核、等信息的标识。
  },
};
```

在 Controller 中，我们就可以使用到刚才定义的这个便捷属性了：

```
// ./app/controller/home.js
const Controller = require('egg').Controller;//从egg上引入控制器
class HomeController extends Controller {//声明一个类并从constroller继承
    async index() {//声明一个函数
        this.ctx.body = this.ctx.isIOS
            ? '你的操作系统是IOS.'
            : '你的操作系统不是IOS.';
    }
}
module.exports = HomeController;//把这个类默认暴露出去
```

+ 静态资源
  + Egg 内置了`static`插件static 插件默认映射 `app/public/` 目录，我们把静态资源都放到 `app/public` 目录即可：

+ 模板渲染
  + 框架并不强制你使用某种模板引擎，只是约定了 [View 插件开发规范](https://eggjs.org/zh-cn/advanced/view-plugin.html)，开发者可以引入不同的插件来实现差异化定制。

+ 更多用法参见 [View](https://eggjs.org/zh-cn/core/view.html)，在本例中，我们使用 [Nunjucks](https://mozilla.github.io/nunjucks/) 来渲染，先安装对应的插件 [egg-view-nunjucks](https://github.com/eggjs/egg-view-nunjucks) ：

```
npm i egg-view-nunjucks --save
```

开启插件：

```
// ./config/plugin.js
exports.nunjucks = {
  enable: true,//使用
  package: 'egg-view-nunjucks'//使用什么插件
};
// ./config/config.default.js
exports.keys = '此处改为你自己的 Cookie 安全字符串';
// 添加 view 配置
exports.view = {
  defaultViewEngine: 'nunjucks',//默认视图引擎
  mapping: {//.tpl结尾的文件
    '.tpl': 'nunjucks',
  },
};
```

为列表页编写模板文件，一般放置在 `./app/view` 目录下

```
<!-- ./app/view/news/list.tpl -->
<!-- {% %} 来当做模板，与现有的html标记混用。和php干的事情是一样的。-->
<html>
  <head>
    <title>Hacker News</title>
    <link rel="stylesheet" href="/public/css/news.css" />
  </head>
  <body>
    <ul class="news-view view">
      {% for item in list %}<!-- 这里可以直接拿到dataList中的list但无法拿到dataList -->
        <li class="item">
          <a href="{{ item.url }}">{{ item.title }}</a>
        </li>
      {% endfor %}<!-- 结束for循环 -->
    </ul>
  </body>
</html>
```

添加 Controller 和 Router

```
// ./app/controller/news.js
const Controller = require('egg').Controller;
class NewsController extends Controller {
  async list() {
    const dataList = {
      list: [
        { id: 1, title: 'this is news 1', url: '/news/1' },
        { id: 2, title: 'this is news 2', url: '/news/2' }
      ]
    };
    await this.ctx.render('news/list.tpl', dataList);
      //渲染list.tpl文件且把dataList的内容传过去
  }
}

module.exports = NewsController;
// ./app/router.js
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/news', controller.news.list);
};
```

启动浏览器，访问 http://localhost:7001/news 即可看到渲染后的页面。

+ 编写 service
  + 在实际应用中，Controller 一般不会自己产出数据，也不会包含复杂的逻辑，复杂的过程应该交给业务逻辑层 [Service](https://eggjs.org/zh-cn/basics/service.html)。

我们来添加一个 Service 抓取页面的数据 ，如下：这里只是demo写法，根据实际情况再改变

```
// ./app/service/news.js
const Service = require('egg').Service;
class NewsService extends Service {
  async list(page) {//得到传来的页码参数
    // 读取配置拿到API接口
    const { serverUrl } = this.config.news;

    //使用内置的curl发出请求拿回数据
    //结构出来result，在这里给他改名叫做idList
    const { result: idList } = await this.ctx.curl(`${serverUrl}/topstories.json`, {
      data: {//携带信息
        orderBy: '"$key"',//根据什么排序
        startAt: `${page}`,//起始页
        endAt: `${page+1}`,//结束页
      },
      dataType: 'json',//需要返回的数据类型
    });

    // 获取详细信息
    const newsList = await Promise.all(
        //获取对象的所有键名
      Object.keys(idList).map(key => {
        const url = `${serverUrl}/item/${idList[key]}.json`;
        return this.ctx.curl(url, { dataType: 'json' });//再去请求每一个的详细信息
      })
    );
    return newsList.map(res => res.data);//把每一条的数据的data返回出去。
  }
}
module.exports = NewsService;
```

框架提供了内置的 [HttpClient](https://eggjs.org/zh-cn/core/httpclient.html) 来方便开发者使用 HTTP 请求。
`this.ctx.curl(api地址:string,配置:json)`

然后稍微修改下之前的 Controller：

```
// ./app/controller/news.js
const Controller = require('egg').Controller;

class NewsController extends Controller {
  async list() {
    const ctx = this.ctx;
    const page = ctx.query.page || 1;//获取用户url里面的page值没有就返回1
    const newsList = await ctx.service.news.list(page);//传过去，声明newsList接受return回来的数据
    await ctx.render('news/list.tpl', { list: newsList });//把list传过去，他的数据是newsList
  }
}
module.exports = NewsController;
```

还需增加 `app/service/news.js` 中读取到的配置：

```
// ./config/config.default.js
// 添加 news 的配置项
exports.news = {
  serverUrl: 'API接口地址'
};
```

+ 编写扩展

  + 如果时间的数据是 UnixTime 格式的，我们希望显示为便于阅读的格式。框架提供了一种快速扩展的方式，只需在 `app/extend` 目录下提供扩展脚本即可，具体参见[扩展](https://eggjs.org/zh-cn/basics/extend.html)。在这里，我们可以使用 View 插件支持的 Helper 来实现：

    ```js
    npm i moment --save
    // ./app/extend/helper.js
    const moment = require('moment');
    exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();
    ```

+ 在模板里面使用：

  ```html
  <!-- ./app/view/news/list.tpl -->
  <html>
    <head>
      <title>Hacker News</title>
      <link rel="stylesheet" href="/public/css/news.css" />
    </head>
    <body>
      <ul class="news-view view">
        {% for item in list %}
          <li class="item">
            <a href="{{ item.url }}">{{ item.title }}</a>
          </li>
        {% endfor %}
        {{ helper.relativeTime(item.time) }}<!--通过这样的方法使用 -->
      </ul>
    </body>
  </html>
  ```

+ 编写中间

  + 假设我们的新闻站点，禁止百度爬虫访问。可以通过 [Middleware](https://eggjs.org/zh-cn/basics/middleware.html) 判断 User-Agent，如下：

    ```js
    // ./app/middleware/robot.js
    // options === app.config.robot //这里的robot是这个文件的名字
    module.exports = (options, app) => {
      return async function robotMiddleware(ctx, next) {
        const source = ctx.get('user-agent') || '';
        const match = options.ua.some(ua => ua.test(source));
        //some()会让ua数组中的每一项去执行()里面的函数，如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测。
        if (match) {
          ctx.status = 403;
          ctx.message = 'Go away, robot.';//别用中文
        } else {
          await next();//放行
        }
      }
    };
    // ./config/config.default.js
    // 添加中间件
    exports.middleware = [
      'robot'
    ];
    // 添加配置
    exports.robot = {
      ua: [
        /Baiduspider/i,
      ]
    };
    ```

现在可以使用 `curl http://localhost:7001/news -A "Baiduspider"` 看看效果。

如果你是window用户在CMD下是无法执行此命令的，推荐你安装Git Bash运行此命令

+ 配置文件

  > 写业务的时候，不可避免的需要有配置文件，框架提供了强大的配置合并管理功能：

  + 支持按环境变量加载不同的配置文件，如 `config.local.js`， `config.prod.js` 等等。
  + 应用/插件/框架都可以配置自己的配置文件，框架将按顺序合并加载。
  + 具体合并逻辑可参见[配置文件](https://eggjs.org/zh-cn/basics/config.html#配置加载顺序)。

```
// ./config/config.default.js
// 这里是默认值
exports.robot = {
  ua: [
    /curl/i,
    /Baiduspider/i,
  ],
};
// ./config/config.local.js
// 仅在开发模式下读取，将覆盖默认值
exports.robot = {
  ua: [
    /Baiduspider/i,
  ],
};
// ./app/service/some.js
const Service = require('egg').Service;

class SomeService extends Service {
  async list() {
    const rule = this.config.robot.ua;// /Baiduspider/i,
  }
}
module.exports = SomeService;
```

+ 单元测试

单元测试非常重要，框架也提供了 [egg-bin](https://github.com/eggjs/egg-bin) 来帮开发者无痛的编写测试。

测试文件应该放在项目根目录下的 test 目录下，并以 `test.js` 为后缀名，即 `./test/**/*.test.js`。

**表示任何文件夹
*表示任何文件

```
npm i egg-mock --save-dev
```

然后配置依赖和 `npm scripts`配置：

```
{
  "scripts": {
    "test": "egg-bin test",
  }
}
// ./test/app/middleware/robot.test.js
const { app, mock, assert } = require('egg-mock/bootstrap');
//他会去找到./app/middleware/robot.js进行测试
describe('test/app/middleware/robot.test.js', () => {
  it('爬虫', () => {
    return app.httpRequest()
      .get('/')
      .set('User-Agent', "Baiduspider")
      .expect(403);
  });
});
```