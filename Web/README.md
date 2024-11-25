# SadiESG管理后台

## 框架及版本要求

- Node 18+
- Vue 3
- [ElementPlus](https://element-plus.org/zh-CN/)
- Vite构建工具
- TypeScript
- ESLint
- 建议使用pnpm作为包管理工具

## 目录结构

```
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── assets
│   ├── components
│   ├── router
│   ├── store
│   ├── styles
│   ├── utils
│   ├── views
│   ├── App.vue
│   ├── main.ts
│   └── shims-vue.d.ts
├── .gitignore
├──  babel.config.js
├──  package.json
├──  pnpm-lock.yaml
├──  README.md
├──  vite.config.ts
└──  tsconfig.json
```

## 项目安装

```bash
npm install
```

### 开发模式运行（带热加载）

```bash
npm run dev
```

### 生产环境编译

```bash
npm run build
```

## 已集成功能
- router
- store
- 登录/登出
- 主页框架
