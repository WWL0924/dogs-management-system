import React from "react";
import lazyLoad from "../utils/lazyLoad";
import LayoutIndex from "@/layout";

const Role = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/sys/role',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/role/index'))),
        meta: {
          title: '角色',
          key: '/sys/role'
        }
      }
    ]

  },


]

export default Role