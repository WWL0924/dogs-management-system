import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";


const Review = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/admin/all',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/admin/all/index'))),
        meta: {
          title: '犬只总览',
          key: '/admin/all',

        }
      }
    ]

  },


]

export default Review 
