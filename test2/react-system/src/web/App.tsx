import { BrowserRouter } from "react-router-dom"
import Router from "@/routers/index"
import AuthRouter from "@/routers/utils/authRouter"
import { ConfigProvider } from 'antd'

function App() {


  return (

    // 统一全局主题
    <ConfigProvider
      theme={{
        token: {
          // 这里的颜色就是我们要的主色调：清新绿
          colorPrimary: '#087e92',
          colorText: '#17333b',
          colorTextSecondary: '#627780',
          colorBorder: '#d7e4e8',
          colorBgLayout: '#eef3f5',
          colorSuccess: '#3e916d',
          colorWarning: '#c98632',
          colorError: '#bd5262',
          // 圆角也稍微圆润一点，增加亲和力
          borderRadius: 8,
          // 字体优化
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          // 阴影优化
          boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
        },
        components: {
          Layout: {
            bodyBg: '#eef3f5',
            headerBg: '#ffffff',
          },
          Card: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          }
        }
      }}
    >
      {/* 提供路由运行环境 */}
      {/* 感知url变化 */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {/* 路由守卫 */}
        <AuthRouter>
          {/* 根据用户角色渲染不同首页 共用一个layout */}
          <Router />
        </AuthRouter>
      </BrowserRouter>
    </ConfigProvider>
    // 全局主题
  )
}

export default App
