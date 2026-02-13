import { BrowserRouter } from "react-router-dom"
import Router from "@/routers/index"
import AuthRouter from "@/routers/utils/authRouter"



function App() {


  return (
    // 提供路由运行环境
    <BrowserRouter>
      <AuthRouter>
        {/* 根据用户角色渲染不同首页 共用一个layout */}
        <Router />
      </AuthRouter>
    </BrowserRouter>
  )
}

export default App
