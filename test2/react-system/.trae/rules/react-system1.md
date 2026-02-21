# React 项目执行规则（Agent 使用）

## 1. 技术规范

- React 18+
- TypeScript
- 函数组件 + Hooks
- React Router 6
- 构建工具：Vite
- 状态管理优先 useState / useReducer，复杂场景使用 Zustand
<!-- 这个项目的状态管理是这样的 -->
- 状态管理 redux

禁止：
- class 组件

## 2. 目录结构（必须遵守）
src/
assets/ 静态资源
components/ 通用组件
doc/ 项目文档
hooks/ 自定义 hooks
layout/ 布局组件
redux/ 状态管理
routers/ 路由配置
types/ 全局类型定义
utile/ 工具函数
views/ 页面组件
App.tsx 根组件
main.tsx 入口文件

规则：
- 页面组件必须放在 views
- 可复用组件必须放在 components
- 布局结构放在 layout
- 所有状态管理逻辑放在 redux
- 路由相关配置放在 routers
- 类型声明统一放在 types
- 工具函数放在 utile
- 禁止新增未定义的顶级目录
- 禁止跨目录随意放置文件


## 3. 组件规则

- 一个组件一个文件
- 文件名使用 PascalCase
- 不在 render 期间执行副作用
- JSX 中禁止复杂逻辑，必须抽离


## 4. 请求与数据规则

- 异步逻辑必须使用 useEffect 或自定义 hook
- 禁止重复请求逻辑



## 5. 状态管理规则

- 优先使用局部 state
- 仅跨页面共享数据进入 store
- UI 临时状态禁止放入全局



## 6. 代码质量规则

- 必须通过 ESLint
- 禁止魔法字符串与魔法数字
- 保证类型安全
- 避免重复代码



## 7. 性能规则

- 列表必须提供稳定 key
- 路由组件必须懒加载
- 必要时使用 memo / useMemo / useCallback



## 8. 输出约束

- 输出完整可运行代码的同时输出解释
- 不修改未要求文件

## 9. 项目用途

- 本科生毕业设计
- 实习生简历中的项目