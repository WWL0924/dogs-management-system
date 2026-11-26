//
import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout";

const Complain = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/resident/complain',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/resident/complain/index'))),
        meta: {
          title: '投诉',
          key: '/resident/complain'
        }
      }
    ]

  },


]

export default Complain
