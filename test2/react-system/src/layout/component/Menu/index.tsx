import { useEffect, useState } from 'react'
import Logo from './components/logo'
import { Spin, Menu } from 'antd'
import type { MenuProps } from 'antd';
// 包里所有的图标组件导入到Icons对象
import * as Icons from '@ant-design/icons'
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthRouter } from '@/redux/module/auth/action';
import { connect } from 'react-redux';

// 定义类型
type MenuItem = Required<MenuProps>['items'][number];

// 动态渲染icon图标
const customIcons: { [key: string]: any } = Icons
const renderIcon = (icon: string) => {
  if (!icon) return null
  const IconComp = customIcons[icon]
  return IconComp ? React.createElement(IconComp) : null
}

// 处理数据格式
const getItem = (
  label: React.ReactNode,
  key: string | undefined,
  icon?: React.ReactNode,
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

// 数据转换逻辑 (抽离到外部避免重复创建)
const deepLoopFloat = (menuList: any[], newArr: MenuItem[] = []): MenuItem[] => {
  menuList.forEach((item: any) => {
    if (!item.children?.length) {
      newArr.push(getItem(item.label, item.path, renderIcon(item.icon)))
    } else {
      newArr.push(getItem(item.label, item.path, renderIcon(item.icon), deepLoopFloat(item.children)))
    }
  })
  return newArr
}

// 把菜单处理成一维数组 (抽离到外部)
const handleRouter = (routerList: any[], newArr: string[] = []): string[] => {
  routerList.forEach((route: any) => {
    if (route.children && route.children.length > 0) {
      handleRouter(route.children, newArr)
    } else {
      newArr.push(route.path)
    }
  })
  return newArr
}

// 解析路径获取展开的父菜单
const getOpenKeys = (path: string) => {
  let newStr: string = ''
  const newArr: string[] = []
  const arr = path.split('/').filter(i => i).map(i => '/' + i)
  for (let i = 0; i < arr.length; i++) {
    newStr += arr[i]
    newArr.push(newStr)
  }
  return newArr
}

interface LayoutMenuProps {
  role: string;
  setAuthRouter: (routerList: string[]) => void;
}

const LayoutMenu = (props: LayoutMenuProps) => {
  const { role, setAuthRouter } = props
  console.log('菜单页面获取的role', role)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // 状态定义
  const [menuList, setMenuList] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 获取菜单数据
  const getMenuData = () => {
    setLoading(true)
    try {
      const data1: { [key: string]: any } = {
        resident: [
          {
            path: '/resident',
            label: '居民功能',
            icon: 'UserOutlined',
            children: [
              { path: '/resident/mine', label: '我的犬只', icon: 'HomeOutlined' },
              { path: '/resident/details', label: '犬只详情', icon: 'InfoCircleOutlined' },
              { path: '/resident/complain', label: '投诉与举报', icon: 'WarningOutlined' },
              { path: '/resident/rules', label: '社区规范', icon: 'BookOutlined' },
            ]
          }
        ],
        admin: [
          {
            path: '/admin',
            label: '管理员功能',
            icon: 'SettingOutlined',
            children: [
              { path: '/admin/todo', label: '待办统计', icon: 'ProfileOutlined' },
              { path: '/admin/review', label: '登记审核', icon: 'AuditOutlined' },
              { path: '/admin/manage', label: '犬只管理', icon: 'DatabaseOutlined' },
              { path: '/admin/deal', label: '投诉处理', icon: 'AlertOutlined' },
            ]
          }
        ]
      };

      const data = data1[role] || []
      const processedMenu = deepLoopFloat(data)
      setMenuList(processedMenu)

      // 更新 Redux 权限路由
      const routerPaths = handleRouter(data)
      setAuthRouter(routerPaths)

      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('获取菜单数据失败:', err)
    }
  }

  // 初始化菜单数据
  useEffect(() => {
    getMenuData()
  }, [role])

  // 监听路由变化更新选中和展开状态
  useEffect(() => {
    setSelectedKeys([pathname])
    setOpenKeys(getOpenKeys(pathname))
  }, [pathname])

  // 手动切换展开状态
  const onOpenChange = (keys: string[]) => {
    if (keys.length === 0 || keys.length === 1) {
      setOpenKeys(keys)
      return
    }
    const latestKey = keys[keys.length - 1]
    if (latestKey.includes(keys[0])) {
      setOpenKeys(keys)
    } else {
      setOpenKeys([latestKey])
    }
  }

  // 点击菜单跳转
  const clickMenu: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <div className="Layout-menu">
      <Logo />
      <Spin spinning={loading} tip="加载中...">
        <Menu
          theme='dark'
          mode="inline"
          items={menuList}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={onOpenChange}
          onClick={clickMenu}
        />
      </Spin>
    </div>
  )
}

const mapDispathToProps = { setAuthRouter }
const mapStateToProps = (state: any) => ({
  role: state.global.userInfo.role
})

export default connect(mapStateToProps, mapDispathToProps)(LayoutMenu)
