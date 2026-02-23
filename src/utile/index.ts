import type { RouteObject } from '@/routers/interface/index'

const searchRoute = (key: string, routes: RouteObject[]) => {
  console.log('搜索路由参数', key, routes)

  for (let i = 0; i < routes.length; i++) {
    const item = routes[i]
    if (item.path === key) {

      return item
    } else if (item.children) {
      const res = searchRoute(key, item.children)
      if (res) return res
      //我一开始是这么写的所以这里出问题的 
      // searchRoute(key, item.children)
    }
  }
}

export default searchRoute
