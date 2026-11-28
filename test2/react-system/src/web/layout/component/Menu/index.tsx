import { useEffect, useMemo, useState } from 'react'
import Logo from './components/logo'
import { Menu } from 'antd'
import type { MenuProps } from 'antd';
// 包里所有的图标组件导入到Icons对象
import * as Icons from '@ant-design/icons'
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthRouter } from '@/redux/module/auth/action';
import { connect } from 'react-redux';
import type { RootState } from '@/redux/interface';

// 定义类型
type MenuItem = Required<MenuProps>['items'][number];
type MenuNode = { path: string; label: string; icon: string; children?: MenuNode[] }

// 动态渲染icon图标
const customIcons = Icons as unknown as Record<string, React.ComponentType>
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
const deepLoopFloat = (menuList: MenuNode[], newArr: MenuItem[] = []): MenuItem[] => {
  menuList.forEach((item) => {
    if (!item.children?.length) {
      newArr.push(getItem(item.label, item.path, renderIcon(item.icon)))
    } else {
      newArr.push(getItem(item.label, item.path, renderIcon(item.icon), deepLoopFloat(item.children)))
    }
  })
  return newArr
}

// 把菜单处理成一维数组 (抽离到外部)
const handleRouter = (routerList: MenuNode[], newArr: string[] = []): string[] => {
  routerList.forEach((route) => {
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
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // 状态定义
  const [openKeys, setOpenKeys] = useState<string[]>(() => getOpenKeys(pathname))

  // 获取菜单数据
  const { menuList, routerPaths } = useMemo(() => {
    try {
      const data1: Record<string, MenuNode[]> = {
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
              { path: '/resident/announcements', label: '社区公告', icon: 'NotificationOutlined' },
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
              { path: '/admin/all', label: '犬只总览', icon: 'AuditOutlined' },
              { path: '/admin/manage', label: '登记审核', icon: 'DatabaseOutlined' },
              { path: '/admin/deal', label: '投诉处理', icon: 'AlertOutlined' },
              { path: '/admin/announcements', label: '公告管理', icon: 'NotificationOutlined' },
            ]
          }
        ]
      };
      // 从data1中根据role获取对应菜单数据 如果role不存在则返回空数组
      const data = data1[role] || []
      const processedMenu = deepLoopFloat(data) // ui更新

      // 更新 Redux 权限路由
      const routerPaths = handleRouter(data)
      return { menuList: processedMenu, routerPaths }
    } catch (err) {
      console.error('获取菜单数据失败:', err)
      return { menuList: [] as MenuItem[], routerPaths: [] as string[] }
    }
  }, [role])

  // 初始化菜单数据
  useEffect(() => {
    setAuthRouter(routerPaths)
  }, [routerPaths, setAuthRouter])

  // 监听路由变化更新选中和展开状态
  useEffect(() => {
    void Promise.resolve().then(() => setOpenKeys(getOpenKeys(pathname)))
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
  //这里 点击主菜单也应该跳转吧
  const clickMenu: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <div className="Layout-menu">
      <Logo />
      <Menu
          theme='light'
          mode="inline"
          items={menuList}
          openKeys={openKeys}
          selectedKeys={[pathname]}
          // 点击主菜单就会把子菜单展开 而不是跳转主页面的功能是不是要在这改呢
          //改完之后怎么展开子菜单呢 只点旁边的小三角不行么
          onOpenChange={onOpenChange}
          onClick={clickMenu}
      />
    </div>
  )
}

const mapDispathToProps = { setAuthRouter }
const mapStateToProps = (state: RootState) => ({
  role: state.global.userInfo?.role || ''
})

export default connect(mapStateToProps, mapDispathToProps)(LayoutMenu)
