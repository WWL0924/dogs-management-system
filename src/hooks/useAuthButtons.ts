import { useLocation } from "react-router-dom"
import { routerArray } from '@/routers/index'
import searchRoute from '@/utile/index'
import { store } from "@/redux"

//获取页面按钮
const useAuthButtons = () => {
  const { pathname } = useLocation()
  //路由配置中找和当前路径对应的路由对象
  const route = searchRoute(pathname, routerArray)
  console.log('当前路由对象', route)
  if (!route || !route.path) {
    return { BUTTONS: [] } // 返回空权限，防止页面崩盘
  }
  const key1 = store.getState()
  console.log('key1.auth.authButtons', key1.auth.authButtons)
  const key2 = route.path
  console.log('获取按钮功能字符串', key1.auth.authButtons[key2])
  return {
    //拿到store中目前state的[\"add\"]
    BUTTONS: key1.auth.authButtons[key2] || []
  }
}

export default useAuthButtons