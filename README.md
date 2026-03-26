# 软考高项 - 项目管理理论

> 在线访问：https://fab617.github.io/project-manage-knowledge-base-cn

一款用于备考信息系统项目管理师（高项）的学习工具，涵盖项目管理核心知识体系。

## 功能特性

- **过程组**：十大知识领域、五大过程组
- **工具与技术**：项目管理中常用的工具与技术
- **输入输出**：各过程的输入、输出及技术工具
- **绩效域**：项目绩效域相关内容
- **语音播报**：支持语音朗读内容

## 技术栈

- React 19
- Vite 8
- React Router 7
- Ant Design 6
- Less

## 项目结构

```
processes/
├── public/
│   └── 404.html          # 404 页面
├── src/
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useScrollToTop.js
│   │   └── useSpeechSynthesis.js
│   ├── views/            # 页面组件
│   │   ├── home/         # 首页
│   │   ├── process/      # 过程组
│   │   ├── tool/         # 工具与技术
│   │   ├── io/           # 输入输出
│   │   └── performance/  # 绩效域
│   ├── DataContext.jsx   # 数据上下文
│   ├── main.jsx          # 入口文件
│   └── styles/           # 样式文件
├── vite.config.js        # Vite 配置
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 部署配置

### 自定义部署路径

项目默认部署路径为 `/`，可通过环境变量指定自定义路径：

```bash
# 指定自定义路径
VITE_BASE_PATH=my-project npm run build
```

构建产物将部署到 `/my-project/` 路径下。

### 注意事项

- `VITE_BASE_PATH` 环境变量同时控制 vite base 配置和 React Router basename
- 不设置时默认使用 `/files/pm/`
- 设置为 `/` 时部署到根路径

## 开发规范

- 使用 ESLint 进行代码检查：`npm run lint`
- 遵循 React Hooks 规则
- 组件样式使用 Less 编写

## License

MIT
