import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";


const Deal = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/admin/deal',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/admin/deal/index'))),
        meta: {
          title: '投诉处理',
          key: '/admin/deal',

        }
      }
    ]

  },


]

export default Deal
