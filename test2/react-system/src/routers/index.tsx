import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import lazyLoad from "./utils/lazyLoad";
import { store } from "@/redux";
import { LayoutIndex } from "./constant";
//引入
import NoPermission from '@/views/errorPage/403'
import NoFound from '@/views/errorPage/404'




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
  {
    path: '/',
    element: <Navigate to='/login' />
  },
  {
    path: '/login',
    name: '/home',
    element: lazyLoad(React.lazy(() => import('@/views/Login'))),
    // 补充信息
    meta: {
      // 不需要登录验证
      requireAuth: false,
      title: '登录',
      key: 'login'
    }
  },
  //定义loading 路由
  //系统初始化的缓冲
  {
    element: <LayoutIndex />,
    path: '/',
    meta: {
      title: 'loading',
    },
    children: [
      {
        path: '/loading',
        element: lazyLoad(React.lazy(() => import('@/views/loading/index'))),
        meta: {
          title: 'loading',
          key: '/loading'
        }
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
