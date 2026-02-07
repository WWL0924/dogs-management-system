import { Spin } from 'antd'
import { Suspense } from 'react'

const lazyLoad = (Comp: React.LazyExoticComponent<any>): React.ReactNode => {
  return (
    // fallback是react节点
    //这里回调函数的内容是一个组件 意思是什么时候加载下面的组件呢
    <Suspense fallback={
      <Spin
        size='large'
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      />
    }>
      {/* 懒加载组件 */}
      <Comp />
    </Suspense>


  )

}

export default lazyLoad