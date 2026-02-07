import React from "react";
import lazyLoad from "../utils/lazyLoad";
import LayoutIndex from "@/layout/index";

const Home = [
  {
    element: <LayoutIndex />,
    children: [
      {
        path: '/sys/home',
        // 副菜单
        element: lazyLoad(React.lazy(() => import('@/views/home/index')))
      }
    ]

  },


]

export default Home