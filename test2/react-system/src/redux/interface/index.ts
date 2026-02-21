export interface GlobalState {
  token: string,
  userInfo: UserInfo
}

export interface AuthState {
  authRouter: string[],
  authButtons: {
    [propName: string]: any
  }
}
//身份
export interface UserInfo {
  role: 'resident' | 'admin',
  account: string,
}