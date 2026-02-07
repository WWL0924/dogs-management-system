import { BrowserRouter } from "react-router-dom"
import Router from "@/routers/index"
import AuthRouter from "@/routers/utils/authRouter"


function App() {


  return (
    // 提供路由运行环境
    <BrowserRouter>
      <AuthRouter>
        <Router />
      </AuthRouter>
    </BrowserRouter>
  )
}

export default App
