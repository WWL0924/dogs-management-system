export interface GlobalState {
  token: string,
  userInfo: UserInfo
}

export interface AuthState {
  authRouter: string[],
  authButtons: {
    [propName: string]: string[]
  }
}
export interface RootState {
  global: GlobalState,
  auth: AuthState
}
//身份
export interface UserInfo {
  role: 'resident' | 'admin',
  account: string,
  name: string
}
