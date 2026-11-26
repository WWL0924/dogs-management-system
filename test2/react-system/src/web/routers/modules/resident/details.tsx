import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout";

const Details = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/resident/details',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/resident/details/index'))),
        meta: {
          title: '犬只详情',
          key: '/resident/details'
        }
      }
    ]

  },


]

export default Details