import type { AuthState } from "@/redux/interface/index"
import type { Action } from "redux"
import * as types from '@/redux/mutation-types'
import { produce, type Draft } from "immer"


const authRouter: AuthState = {
  authRouter: []
}

interface SET_AUTH_ROUTER extends Action {
  type: typeof types.SET_AUTH_ROUTER,
  authRouter: []
}

type ActionType = SET_AUTH_ROUTER
const auth = (state: AuthState = authRouter, action: ActionType) => {
  return produce(state, (draftState: Draft<AuthState>) => {
    switch (action.type) {
      case types.SET_AUTH_ROUTER:
        draftState.authRouter = action.authRouter;
        break;
      default:
        break
    }
  })
}

export default auth