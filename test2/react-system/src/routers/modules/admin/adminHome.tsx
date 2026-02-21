import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";

const AdminHome = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/admin',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/admin/index'))),
        meta: {
          title: '管理员首页',
          key: '/admin',
        }
      }
    ]

  },


]

export default AdminHome
