import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";

const ResidentHome = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/resident',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/resident/index'))),
        meta: {
          title: '居民首页',
          key: '/resident',
        }
      }
    ]

  },


]

export default ResidentHome
