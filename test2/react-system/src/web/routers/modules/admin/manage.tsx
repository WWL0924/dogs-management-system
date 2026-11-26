import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";



const Manage = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/admin/manage',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/admin/manage/index'))),
        meta: {
          title: '登记审核',
          key: '/admin/manage',

        }
      }
    ]

  },


]

export default Manage
