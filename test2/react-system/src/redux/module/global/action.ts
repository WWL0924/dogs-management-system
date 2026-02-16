//操作action
import type { UserInfo } from '@/redux/interface'
import * as types from '@/redux/mutation-types'

//settoken
//定义action
export const setToken = (token: string) => ({
  type: types.SET_TOKEN,
  token
})

//设置用户身份
export const setUserInfo = (userInfo: UserInfo) => {
  return {
    type: types.SET_USER_INFO,
    userInfo
  }
}
