import { BrowserRouter } from "react-router-dom"
import Router from "@/routers/index"
import AuthRouter from "@/routers/utils/authRouter"
import { ConfigProvider } from 'antd'

function App() {


  return (
    // 提供路由运行环境
    <ConfigProvider
      theme={{
        token: {
          // 这里的颜色就是我们要的主色调：清新绿
          colorPrimary: '#52c41a',
          // 圆角也稍微圆润一点，增加亲和力
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <AuthRouter>
          {/* 根据用户角色渲染不同首页 共用一个layout */}
          <Router />
        </AuthRouter>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
