import { Layout } from "antd"
import Sider from "antd/es/layout/Sider"
import { Outlet } from "react-router-dom"
// 引入样式
import './index.less'
import LayoutMenu from "./component/Menu"
import { store } from "@/redux"


const LayoutIndex = () => {
  //从store中获取token
  // const userToken = store.getState().global.token
  // if (!userToken) {
  //   return <NavLink to='/login' />
  // }
  return (
    <div className="container">
      <Sider collapsible width={220} theme="dark" >
        <LayoutMenu />
      </Sider>
      <Layout>
        <Layout.Header>
          header
        </Layout.Header>
        <Layout.Content>
          {/* 子路由的占位符 home组件会渲染到这个位置 */}
          <Outlet />
        </Layout.Content>
        <Layout.Footer>
          footer
        </Layout.Footer>
      </Layout>
    </div>
  )
}

export default LayoutIndex