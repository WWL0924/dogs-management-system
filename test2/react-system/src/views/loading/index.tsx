import { store } from "@/redux"
import { Navigate, useNavigate } from "react-router-dom"

const Loading = () => {
  //loading初始化页面
  //跳转功能
  const navigate = useNavigate()
  //这里读取authRouter是读取什么内容 state么 也就是路由信息的path么 
  const { authRouter } = store.getState().auth
  return (
    <>
      {authRouter && authRouter.length > 0 ?
        <Navigate to={authRouter[0]} />
        : < h1 > Loading </h1 >}
    </>
  )
}

export default Loading