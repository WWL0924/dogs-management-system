import React from "react";
import lazyLoad from "../../utils/lazyLoad";
import LayoutIndex from "@/layout/index";


const Todo = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/admin/todo',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/admin/todo/index'))),
        meta: {
          title: '待办清单',
          key: '/admin/todo',

        }
      }
    ]

  },


]

export default Todo
