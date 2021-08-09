##  eslint-plugin-react-hooks配置

#### 在使用create-react-app脚手架生成项目后，使用hooks特性没有eslint提示报错信息。可安装 `eslint-plugin-react-hooks`并配置`package.json`中的`eslintConfig`即可

+ 安装

  ```bash
  npm install eslint-plugin-react-hooks --save -dev
  //
  yarn add eslint-plugin-react-hooks --dev
  ```

+ 配置`package.json`

```json
  "eslintConfig": {
    "extends": "react-app",
    "plugins": [
      "react-hooks"
    ],
    "rules": {
      "react-hooks/rules-of-hooks": "error"
    }
  },
```

