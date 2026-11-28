import { Breadcrumb, Button, Layout } from "antd"
import { HomeOutlined } from "@ant-design/icons"
import Sider from "antd/es/layout/Sider"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
// 引入样式
import './index.less'
import LayoutMenu from "./component/Menu"
// import { store } from "@/redux"
import { setAuthButton } from "@/redux/module/auth/action"
import { connect } from "react-redux"
import { useCallback, useEffect } from "react"
import type { RootState } from '@/redux/interface'

const pageLabels: Record<string, string> = {
  '/admin/todo': '待办统计',
  '/admin/all': '犬只总览',
  '/admin/manage': '登记审核',
  '/admin/deal': '投诉处理',
  '/admin/announcements': '公告管理',
  '/resident/mine': '我的犬只',
  '/resident/details': '犬只详情',
  '/resident/complain': '投诉与举报',
  '/resident/rules': '社区规范',
  '/resident/announcements': '社区公告'
}


const LayoutIndex = (props: { setAuthButton: typeof setAuthButton; role: string; name: string }) => {

  //这里是从LayoutIndex组件的props解构出setAuthButton和role(权限)
  const { setAuthButton, role } = props
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const homePath = role === 'admin' ? '/admin' : '/resident'
  const currentPath = pathname.replace(/\/+$/, '')
  const pageLabel = pageLabels[currentPath]
  const isHome = currentPath === homePath

  //这里先写用户界面
  console.log('从store中取出的role', role)
  const getAuthButtonsList = useCallback(async () => {
    const data = {
      '/resident/mine': ['add', 'del']
    }
    //实际上的写法 等接口请求完成 await拿到返回结果再往下执行
    //const data = await getAuthButtonsList()
    setAuthButton(data)
  }, [setAuthButton])

  useEffect(() => {
    getAuthButtonsList()
  }, [getAuthButtonsList])

  return (
    <div className="container">
      <Sider collapsible width={220} theme="light" >
        {/* 这里根据role来显示不同的菜单 */}
        <LayoutMenu />
      </Sider>
      <Layout>
        <Layout.Header className="site-layout-header">
          <Button
            className="header-home-button"
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate(homePath)}
          >
            首页
          </Button>
          {/* 显示用户名 */}
          <div className="header-user-info">
            欢迎，{props.name}
          </div>
        </Layout.Header>
        <Layout.Content className="site-layout-content">
          <Breadcrumb
            className={isHome ? 'page-breadcrumb page-breadcrumb-home' : 'page-breadcrumb'}
            items={[
              { title: isHome ? '首页' : <Link to={homePath}>首页</Link> },
              ...(pageLabel ? [{ title: pageLabel }] : [])
            ]}
          />
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
const mapStateToProps = (state: RootState) => {
  return {
    token: state.global.token,
    role: state.global.userInfo.role,
    name: state.global.userInfo.name
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex)
