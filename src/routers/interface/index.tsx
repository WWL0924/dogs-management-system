//路由配置对象
export interface RouteObject {
  path?: string,
  element?: React.ReactNode,
  children?: RouteObject[],
  //路由的附加信息
  meta?: MetaProps;
}

export interface MetaProps {
  requiresAuth?: boolean,
  title?: string;
  key?: string
}