import type { AuthState } from "@/redux/interface/index"
import type { Action } from "redux"
import * as types from '@/redux/mutation-types'
import { produce, type Draft } from "immer"
const authRouter: AuthState = {
  authRouter: [],
  authButtons: []
}
interface SET_AUTH_ROUTER extends Action {
  type: typeof types.SET_AUTH_ROUTER,
  authRouter: []
}
//action类型
interface SET_AUTH_BUTTON extends Action {
  type: typeof types.SET_AUTH_BUTTON,
  authButtons: []
}
//reducer 能处理的 action 
type ActionType = SET_AUTH_ROUTER | SET_AUTH_BUTTON

const auth = (state: AuthState = authRouter, action: ActionType) => {
  return produce(state, (draftState: Draft<AuthState>) => {
    switch (action.type) {
      case types.SET_AUTH_ROUTER:
        draftState.authRouter = action.authRouter;
        break;
      case types.SET_AUTH_BUTTON:
        draftState.authButtons = action.authButtons;
        break;
      default:
        break
    }
  })
}

export default auth