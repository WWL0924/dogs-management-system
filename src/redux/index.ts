
//一 引入基础能力
//中间件增强 dispatch 多个reducer合并成一个根reducer 
// 把多个中间件devtools等组合成增强器 创建redux store
import { applyMiddleware, combineReducers, compose, createStore } from "redux"
//包装reducer 让state持久化
import persistReducer from "redux-persist/es/persistReducer"
//持久化控制器
import persistStore from "redux-persist/es/persistStore"
// 默认的 web storage（localStorage）
import storage from "redux-persist/lib/storage"
//action支持写函数 用来处理异步逻辑
import { thunk } from "redux-thunk"
import global from './module/global/reducer'
import auth from "./module/auth/reducer"


//二 redux 持久化配置
//redux的state会以这个key存进localStorage
//刷新页面 → 从 localStorage 里恢复 Redux 状态。
const persistConfig = {
  key: 'redux-state',
  storage: storage,
}
//三 创建业务 把多个 reducer 合成一个根 reducer
//Redux 的 state 结构会变成 { global: globalReducerState ,auth: authReducerState}
//每个 reducer 只管自己那一块 state
//这是 Redux 的“分模块管理 state”
const reducer = combineReducers({
  global,
  auth
})

//四 reducer加上持久化能力
const persisitReducerConfig = persistReducer(persistConfig, reducer)

//五 Redux DevTools 
//在浏览器看到state变化 每一次action 时间回溯
const composeEnhancers = window._REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose


//六 中间件
//注册 thunk 中间件，支持 dispatch 函数（异步 action）
const middleWares = applyMiddleware(thunk)


//七 创建store
//注册reducer 注册中间件(支持异步) 打开devtools
//store 是 Redux 的唯一数据源
const store: Store = createStore(
  persisitReducerConfig,
  composeEnhancers(middleWares)
)

//八 创建persisitor
//控制“什么时候恢复 / 清空 / 暂停持久化”
//React 项目中通常配合 <PersistGate />
const persistor = persistStore(store)



export { store, persistor }
