import * as types from '@/redux/mutation-types'


//封装 action创建函数 生成一个 固定结构的 action 对象
export const setAuthRouter = (authRouter: string[]) => {
  return {
    type: types.SET_AUTH_ROUTER,
    authRouter
  }

}