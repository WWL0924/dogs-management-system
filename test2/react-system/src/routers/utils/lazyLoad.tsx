import { Spin } from 'antd'
import { Suspense } from 'react'

const lazyLoad = (Comp: React.LazyExoticComponent<any>): React.ReactNode => {
  return (
    <Suspense fallback={ //没加载完成时显示
      // 加载动画
      <div className="loading-container">
        <Spin size='large' />
      </div>
    }>
      {/* 懒加载组件 */}
      <Comp />
    </Suspense>


  )

}

export default lazyLoad