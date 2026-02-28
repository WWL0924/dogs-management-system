import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.less' // 引入全局样式
import App from './App.tsx'
import { Provider } from 'react-redux'
//store是Redux的全局状态容器
import { store, persistor } from './redux/index.ts'
import { PersistGate } from 'redux-persist/integration/react'




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 把store注入到组件树内 */}
    <Provider store={store as any}>
      {/* 从localstorage中读取初始state */}
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
