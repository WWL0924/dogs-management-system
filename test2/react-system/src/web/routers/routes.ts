import type { RouteObject } from './interface'

const metaRouters = import.meta.glob('./modules/**/*.tsx', { eager: true })
console.log('1导入文件夹下的路由文件', metaRouters)

export const routerArray: RouteObject[] = []
Object.values(metaRouters).forEach((module) => {
  Object.values(module as Record<string, RouteObject[]>).forEach((routes) => {
    routerArray.push(...routes)
  })
})
