//操作action
import * as types from '@/redux/mutation-types'

//settoken
//定义action
export const setToken = (token: string) => ({
  type: types.SET_TOKEN,
  token
})