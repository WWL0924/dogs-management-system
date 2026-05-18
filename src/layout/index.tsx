import { Layout } from "antd"
import Sider from "antd/es/layout/Sider"
import { Outlet } from "react-router-dom"
// 引入样式
import './index.less'
import LayoutMenu from "./component/Menu"
// import { store } from "@/redux"
import { setAuthButton } from "@/redux/module/auth/action"
import { connect } from "react-redux"
import { useEffect } from "react"


const LayoutIndex = (props: any) => {

  //这里是从LayoutIndex组件的props解构出setAuthButton和role(权限)
  const { setAuthButton, role } = props

  //这里先写用户界面
  console.log('从store中取出的role', role)
  const getAuthButtonsList = async () => {
    const data = {
      '/resident/mine': ['add', 'del']
    }
    //实际上的写法 等接口请求完成 await拿到返回结果再往下执行
    //const data = await getAuthButtonsList()
    setAuthButton(data)
  }

  useEffect(() => {
    getAuthButtonsList()
  }, [])

  return (
    <div className="container">
      <Sider collapsible width={220} theme="light" >
        {/* 这里根据role来显示不同的菜单 */}
        <LayoutMenu />
      </Sider>
      <Layout>
        <Layout.Header className="site-layout-header">
          {/* 显示用户名 */}
          <div className="header-user-info">
            欢迎，{props.name}
          </div>
        </Layout.Header>
        <Layout.Content className="site-layout-content">
          {/* 子路由的占位符 home组件会渲染到这个位置 */}
          <Outlet />
        </Layout.Content>
        <Layout.Footer className="text-center">
          {new Date().getFullYear()}幸福社区宠物狗管理系统 By 武文靓
        </Layout.Footer>
      </Layout>
    </div>
  )
}

//改数据
const mapDispatchToProps = { setAuthButton }
//取数据
const mapStateToProps = (state: any) => {
  return {
    token: state.global.token,
    role: state.global.userInfo.role,
    name: state.global.userInfo.name
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex)