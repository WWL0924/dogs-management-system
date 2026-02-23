
import { connect } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

const AuthRouter = (props: { children: React.ReactNode, token: string, role: string }) => {
  // 自动变成props的children属性
  const { token, role, children } = props
  //当前路由
  const { pathname } = useLocation()
  console.log('路由守卫打印当前路由', pathname)
  //可以自动放行
  //这里登录和注册为什么可以自动放行呢
  const routerList = ['/404', '/403', '/front', '/', '/register', '/login']
  if (token && pathname === '/login') {
    //点击登录按钮之后 跳转到相应界面
    if (role === 'resident') return <Navigate to="/resident" />
    if (role === 'admin') return <Navigate to="/admin" />
    //确保登录后不会跳转到登录界面
    return <Navigate to="/front" />//退出账号
  }
  if (routerList.includes(pathname)) {
    return children
  }
  if (!token) {
    //从首页到登录页
    return <Navigate to="/front" />//登录账号
  }
  //角色权限
  if ((pathname.includes('admin') && role !== 'admin')
    || (pathname.includes('resident') && role !== 'resident')
  ) {
    return <Navigate to="/403" />
  }

  return children

}

//获取store中的token
const mapStateToProps = (state: any) => {
  return {
    token: state.global.token,
    role: state.global.userInfo?.role || ''
  }
}
export default connect(mapStateToProps, null)(AuthRouter)