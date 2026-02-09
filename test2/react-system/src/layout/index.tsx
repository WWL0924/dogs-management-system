import { Layout } from "antd"
import Sider from "antd/es/layout/Sider"
import { Outlet } from "react-router-dom"
// 引入样式
import './index.less'
import LayoutMenu from "./component/Menu"
import { store } from "@/redux"
import { setAuthButton } from "@/redux/module/auth/action"
import { connect } from "react-redux"
import { useEffect } from "react"


const LayoutIndex = (props: any) => {
  //从store中获取token
  // const userToken = store.getState().global.token
  // if (!userToken) {
  //   return <NavLink to='/login' />
  // }

  //这里是从LayoutIndex组件的props解构出setAuthButton
  const { setAuthButton } = props

  const getAuthButtonsList = async () => {
    const data = {
      '/sys/home': ['add', 'del']

    }
    //实际上的写法 等接口请求完成 await拿到返回结果再往下执行
    //const data = await getAuthButtonsList()
    setAuthButton(data)
  }

  useEffect(() => {
    getAuthButtonsList()
  })

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

//store的state映射成组件的props
const mapDispathToProps = { setAuthButton }
export default connect(null, mapDispathToProps)(LayoutIndex)