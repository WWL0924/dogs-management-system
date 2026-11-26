declare type Recordable<T = unknown> = Record<string, T>
//等价于 { [key: string]: any }
//key 是string value是任意类型的

declare interface ViteEnv {
  VITE_PORT: number;
  VITE_USE_MOCK: boolean;
  VITE_USE_PROXY: boolean;
  VITE_USE_API: string;
  VITE_USE_CDN: boolean;
  VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none';
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean;
  open?: boolean;
  VITE_API_URL?: string;
}

declare interface Store {
  dispatch: (action: unknown) => unknown;
  getState: () => unknown;
  subscribe: (listener: () => void) => () => void;
  replaceReducer: (reducer: unknown) => void;
  [Symbol.observable]?: unknown;
}

interface Window {
  _REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof import('redux').compose;
}

//menu
//类型分组作用域
declare namespace Menu {
  //是ts的类型约束 类似对象但是不是对象数据类型
  interface MenuOptions {
    key?: string;
    label?: string;
    path?: string;
    title?: string;
    icon?: string;
    children?: MenuOptions[];
  }
}

//表单配置接口FormConfigItem
//全局接口类型，不需要 import 即可使用
declare interface FormConfigItem {
  label: string,
  name: string,
  type: 'input' | 'radio' | 'select' | 'checkbox' | 'datepicker' | string,
  options?: { label: string, value: string | number | boolean }[],
  placeholder?: string,
  required?: boolean,
  render?: (value: unknown, record?: Record<string, unknown>) => React.ReactNode,
  disabled?: boolean,
}
