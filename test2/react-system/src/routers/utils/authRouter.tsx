
import { store } from "@/redux"
import { Navigate, useLocation } from "react-router-dom"
//路由守卫组件
const AuthRouter = (props: { children: JSX.element }) => {
  //获取路由信息 当前访问的路径
  const { pathname } = useLocation()
  //从store中取登录状态
  const token = store.getState().global.token
  //如果没有token未登录状态 跳转到登录页
  if (!token) {
    //且访问的不是登录页
    if (pathname !== '/login') {
      //强制跳转到登录页
      //replace 跳转后替换掉历史记录
      return <Navigate to='/login' replace />
    }
    else {
      return props.children
    }
  }
  //已登录但是访问到登录页
  if (pathname == '/login') {
    //跳转到系统初始化页面
    return <Navigate to='/loading' replace />
  }

  //获取权限路由
  const dynmicRouter = store.getState().auth.authRouter
  console.log('获取权限路由 dynmicRouter', dynmicRouter) 
  //默认静态路由加载后台
  const staticRouter = ['/loading', '/403', '/404']
  //routerlist的内容是 前面的所有路由和静态路由吗
  const routerList = [...dynmicRouter, ...staticRouter]
  //没有权限
  if (!routerList.includes(pathname)) {
    //跳转到403
    return <Navigate to='/403' replace />
  }
  //无论权限如何，都会渲染子路由
  return props.children
}

export default AuthRouter