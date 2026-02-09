import type { RouteObject } from '@/routers/interface/index'

const searchRoute = (key: string, routes: RouteObject[]) => {
  // let result: RouteObject | undefined
  for (let i = 0; i < routes.length; i++) {
    const item = routes[i]
    if (item.path === key) {
      //返回前的打印也是正确的
      return item
    } else if (item.children) {
      return searchRoute(key, item.children)
    }
  }
}

export default searchRoute