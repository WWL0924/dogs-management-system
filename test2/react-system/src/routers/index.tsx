import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import lazyLoad from "./utils/lazyLoad";
import { store } from "@/redux";
//引入
import NoPermission from '@/views/errorPage/403'
import NoFound from '@/views/errorPage/404'
import { LayoutIndex } from "./constant";
import Login from "@/views/Login";
import Register from "@/views/Register";



//导入modules文件夹下的路由文件
const metaRouters = import.meta.glob('./modules/*.tsx', { eager: true })
//处理路由
const routerArray = [];
Object.keys(metaRouters).forEach(item => {
  Object.keys(metaRouters[item]).forEach(key => {
    routerArray.push(...metaRouters[item][key])
  });
})
const rootRouter = [
  // 点击首页按钮就到登录页面 然后登录页面的登录成功后再根据role跳转到不同的首页
  //首页
  {
    path: '/',
    element: <Navigate to='/front' />
  },
  {
    path: '/front',
    element: lazyLoad(React.lazy(() => import('@/views/front'))),
  },
  //登录页面
  {
    path: '/login',
    element: <Login />
  },
  //注册页面
  {
    path: '/register',
    element: <Register />
  },
  //根据role跳转到不同的首页
  {
    path: '/admin',
    element: <LayoutIndex />, // 布局
    children: [
      {
        path: '/admin',
        element: lazyLoad(React.lazy(() => import('@/views/admin/index'))),
      },
    ]
  },
  {
    path: '/resident',
    element: <LayoutIndex />, // 布局
    children: [
      {
        path: '/resident',
        element: lazyLoad(React.lazy(() => import('@/views/resident/index'))),
      },
    ]
  },
  ...routerArray,
  //定义403
  {
    path: '/403',
    element: <NoPermission />
  },

  //定义404
  {
    path: '/404',
    element: <NoFound />
  },
  //跳转到404
  {
    path: '*',
    element: <Navigate to='/404/' replace />
  },
]

//根据url渲染element
const Router = () => {
  const routes = useRoutes(rootRouter)
  // console.log('当前的url routes', routes);
  return routes
}

//导出这个组件
export default Router
export { routerArray }
