//引入state类型
import type { GlobalState } from "@/redux/interface";
//引入redux内置的action基础类型
import type { Action } from "redux";
//引入action type常量
import * as types from '@/redux/mutation-types'
//引入immer的produce生成新的state
import { produce, type Draft } from "immer";
import type { UserInfo } from "@/redux/interface";



//描述state
const globalState: GlobalState = {
  token: '',
  userInfo: {
    role: 'resident',
    account: '',
    name: ''
  }

}

//描述reducer能处理哪些action
interface SetTokenAction extends Action {
  type: typeof types.SET_TOKEN,
  token: string
}


//描述reducer能处理哪些action
interface SetUserInfoAction extends Action {
  type: typeof types.SET_USER_INFO,
  userInfo: UserInfo
}

//reducer处理的action约束
type ActionType = SetTokenAction | SetUserInfoAction

//这里是 reducer的核心功能 根据action算出新的state
const global = (state: GlobalState = globalState, action: ActionType) => {
  //produce 使用immer简化不可变数据的更新 可以处理嵌套state
  //类似以下结构
  // {
  //   name:
  //   cla: {

  //   }
  // }
  //produce参数 
  // 当前旧state 不可变
  // draftState可以修改 state的可变草稿可以直接修改 
  //回调函数在调用setAction方法就会执行
  return produce(state, (draftState: Draft<GlobalState>) => {
    //根据当前action类型 来修改state
    switch (action.type) {
      case types.SET_TOKEN:
        draftState.token = action.token;
        break;
      //这里的逻辑我不太懂
      case types.SET_USER_INFO:
        draftState.userInfo = action.userInfo;
        break;
      default:
        break;
    }
  })
}
export default global
