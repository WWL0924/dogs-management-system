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

  //这里是从LayoutIndex组件的props解构出setAuthButton和role(权限)
  const { setAuthButton } = props
  //  const role = useSelector((state: RootState) => state.user.role);
  //这里先写用户界面
  const role = 'resident'
  console.log('角色权限role', role)
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
  }, [])

  return (
    <div className="container">
      <Sider collapsible width={220} theme="dark" >
        {/* 这里根据role来显示不同的菜单 */}
        <LayoutMenu role={role} />
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