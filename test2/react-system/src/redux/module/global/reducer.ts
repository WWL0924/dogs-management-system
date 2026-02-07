//引入state类型
import type { GlobalState } from "@/redux/interface";
//引入redux内置的action基础类型
import type { Action } from "redux";
//引入action type常量
import * as types from '@/redux/mutation-types'
//引入immer的produce生成新的state
import { produce } from "immer";


//描述state
const globalState: GlobalState = {
  token: ''
}

//描述reducer能处理哪些action
interface SetTokenAction extends Action {
  type: typeof types.SET_TOKEN,
  token: string
}


//reducer处理的action约束
type ActionType = SetTokenAction

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
  // state的可变草稿可以直接修改 immer会根据修改 生成一个新的 state
  return produce(state, (draftState: Draft<GlobalState>) => {
    //修改draft后 immer自动生成新的state
    switch (action.type) {
      //修改draftState immer自动生成新的state
      case types.SET_TOKEN:
        draftState.token = action.token;
        break;
      default:
        break;
    }
  })
}
export default global
