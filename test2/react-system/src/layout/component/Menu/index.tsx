import { useEffect, useState } from 'react'
import Logo from './components/logo'
import { Spin, Menu } from 'antd'
import type { MenuProps } from 'antd';
// 包里所有的图标组件导入到Icons对象
import * as Icons from '@ant-design/icons'
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthRouter } from '@/redux/module/auth/auth';
import { connect } from 'react-redux';


const LayoutMenu = (props: any) => {

  //从props解构出来
  //可以这样操作是哪一步实现的 把setAuthRouter存在props中呢
  const { setAuthRouter } = props


  //菜单数据
  const [menuList, setMenuList] = useState<MenuItem[]>([])
  //后端返回的数据
  const [menuData, setMenuData] = useState<Menu.MenuOptions>([])
  //loading
  const [loading, setLoading] = useState(false)
  //获取菜单数据的时候显示loading
  //请求来自后端的菜单数据
  const getMenuData = () => {
    setLoading(true)
    try {
      //模拟后端返回的数据
      const data = [
        {
          path: 'sys/home',
          //这里是antd的图标库
          icon: 'SettingOutlined',
          label: '菜单管理',
          children: [
            {
              path: 'sys/home',
              label: '用户管理'
            },
            {
              path: 'sys/role',
              label: '角色管理'
            }
          ]
        }
      ]
      //这里需要转换成个antdMenu组件items的格式
      setMenuList(deepLoopFloat(data))
      //在这里 根据后端返回 或者前端写死的data
      setMenuData(data)
      //路由菜单变成一维数组 存到redux中
      setAuthRouter(handleRouter(data))
      //获取完数据去掉加载
      setLoading(false)
    }
    catch (err) {
      setLoading(false)
      console.log(err);

    }
  }

  //调用方法
  //副作用处理函数 组件渲染完之后只执行一次
  useEffect(() => {
    getMenuData() //渲染完之后去拿数据
  }, [])

  //把菜单处理成一维数组 只保存children中的路由
  const handleRouter = (routerList: Menu.MenuOptions[], newArr: string[] = []) => {
    routerList.forEach((route: Menu.MenuOptions) => {
      if (route.children && route.children.length > 0) {
        handleRouter(route.children, newArr)
      } else {
        //注意这里是绝对路径
        newArr.push('/' + route.path!)
      }
    })
    console.log('处理数组', newArr)
    return newArr
  }




  //动态渲染icon图标
  const customIcons: { [key: string]: any } = Icons
  const renderIcon = (icon: string) => {
    if (!icon) return null
    //这一步才把字符串转换为节点
    // 这里是从customIcons对象中寻找icon相应的节点
    //返回相应的节点
    return React.createElement(customIcons[icon])
  }



  //数据转换逻辑
  const deepLoopFloat = (menuList: Menu.MenuOptions[], newArr: MenuItem[] = []) => {
    menuList.forEach((item: Menu.MenuOptions) => {
      //不存在children
      if (!item.children?.length) {
        //!非空断言 一定存在不是null或者undefined
        return newArr.push(getItem(item.label, '/' + item.path, renderIcon(item.icon!)))
      }
      //存在children 就把children传进去
      //这里顺序需要对应正确
      newArr.push(getItem(item.label, '/' + item.path, renderIcon(item.icon!), deepLoopFloat(item.children)))
    })
    console.log('deepLoopFloat里面返回的newArr', newArr)
    return newArr
  }

  //定义menu类型
  //antd中menu组件的props类型
  type MenuItem = Required<MenuProps>['items'][number];

  //处理数据格式
  const getItem = (
    label: React.ReactNode,
    key: string | undefined,
    icon?: React.ReactNode,
    //数组类型 可以有一个或者多个MenuItem
    children?: MenuItem[],
    type?: 'group',

  ): MenuItem => {
    return {
      label,
      key,
      icon,
      children,
      type
    } as MenuItem
  }

  //定义变量
  //哪些子菜单是展开的
  const [openKeys, setOpenKeys] = useState<string[]>([])
  //哪些子菜单是选中的
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])


  //定义函数
  //手动点击菜单展开 收起的时候触发
  const onOpenChange = (openKeys: string[]) => {
    //只有一个展开的踩点 直接用
    if (openKeys.length === 0 || openKeys.length === 1)
      return setOpenKeys(openKeys)
    //拿到最新展开的菜单
    const lastestOpenKeys = openKeys[openKeys.length - 1]
    //新展开的是旧菜单的子级
    if (lastestOpenKeys.includes(openKeys[0])) {
      //可以同时展开
      setOpenKeys(openKeys)
    }
    //['/sys', '/order']点开的是另一个一级菜单
    else {
      setOpenKeys([lastestOpenKeys]) //只展开最新的那个
    }
  }

  //定义当前路由
  //从路由里读取信息 pathname表示地址栏路径
  const { pathname } = useLocation()

  //使用副作用函数
  //首次渲染 刷新页面或者路变化(pathname改变) 菜单数据加载完成menulist从[]到有值
  useEffect(() => {
    //选中子菜单 这里selectedkeys的类型是数组
    setSelectedKeys([pathname])
    setOpenKeys(getOpenKeys(pathname)) //展开父菜单
  }, [pathname, menuList]) //当前路由变化

  //返回 展开父菜单 选中子菜单数组 [/sys,/sys/home]
  const getOpenKeys = (path: string) => {
    let newStr: string = ''
    const newArr: any[] = []
    //解析path 
    //这里到底是怎么解析出来的
    const arr = path.split('/').map(i => '/' + i)
    //这里的i为什么从1开始
    for (let i = 1; i < arr.length; i++) {
      newStr += arr[i]
      newArr.push(newStr)
    }
    return newArr
  }


  //跳转方法
  //修改浏览器地址栏 匹配对应route
  const navigate = useNavigate()

  //点击 可点击的菜单项触发
  //这里是Menu组件onclick的类型 MenuProps['onClick']
  //点击MenuItem时 自动把信息传给onClick 解析了key
  const clickMenu: MenuProps['onClick'] = ({ key }: { key: string }) => {
    //从data里找到
    // const route = searchRoute(key, menuData)
    navigate(key)
  }

  return (
    <div className="Layout-menu">
      <Logo />
      {/* 加载样式 加载文案 */}
      <Spin spinning={loading} tip="Loading...">
        <Menu
          theme='dark'
          mode="inline"
          items={menuList}
          // 当前打开
          openKeys={openKeys}
          //当前选中
          selectedKeys={selectedKeys}
          //菜单展开和关闭的时候触发
          onOpenChange={onOpenChange}
          //添加事件
          onClick={clickMenu}
        />
      </Spin>
    </div>
  )
}

const mapDispathToProps = { setAuthRouter }
export default connect(null, mapDispathToProps)(LayoutMenu)