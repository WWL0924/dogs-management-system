import * as types from '@/redux/mutation-types'


//封装 action创建函数 生成一个 固定结构的 action 对象
export const setAuthRouter = (authRouter: string[]) => {
  return {
    type: types.SET_AUTH_ROUTER,
    authRouter
  }
}

//设置按钮权限
export const setAuthButton = (authButtons: { [propName: string]: any }) => {
  console.log('2-------生成action---------', authButtons)
  return {
    type: types.SET_AUTH_BUTTON,
    //这里的属性名拼接一个'/'
    authButtons
  }
}


//这个是传入setAuthButton函数的参数的结构
// [
//   {
//     'sys/home':['add','del']
//   }
// ]