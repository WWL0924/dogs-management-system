import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";

const Mine = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/resident/mine',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/resident/mine/index'))),
        meta: {
          title: '我的犬只',
          key: '/resident/mine',

        }
      }
    ]

  },


]

export default Mine
