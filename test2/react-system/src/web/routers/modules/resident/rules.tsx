import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout";

const Rules = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/resident/rules',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/resident/rules/index'))),
        meta: {
          title: '社区规范',
          key: '/resident/rules'
        }
      }
    ]

  },


]

export default Rules