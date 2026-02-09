import { useLocation } from "react-router-dom"
import { routerArray } from '@/routers/index'
import searchRoute from '@/utile/index'
import { store } from "@/redux"

//获取页面按钮
const useAuthButtons = () => {
  const { pathname } = useLocation()
  console.log(pathname, routerArray)//这里的数据也对了
  //路由配置中找和当前路径对应的路由对象
  const route = searchRoute(pathname, routerArray)
  const key1 = store.getState()
  console.log('key1.auth.authButtons', key1.auth.authButtons)
  const key2 = route.path
  return {
    //拿到store中目前state的[\"add\"]
    BUTTONS: key1.auth.authButtons[key2]
  }
}

export default useAuthButtons