import useAuthButtons from "@/hooks/useAuthButtons"


type ButtonComponent = JSX.Element | null
interface ButtonPerProps {
  btn: string,
  Comp: ButtonComponent
}

//按钮权限组件 只负责要不要显示 真正的按钮由 Comp 传进来
const ButtonPer = ({ btn, Comp }: ButtonPerProps): JSX.Element | null => {
  const { BUTTONS } = useAuthButtons() //查当前页面按钮权限
  console.log('当前页面允许的按钮', BUTTONS)
  //这个按钮不需要权限控制
  if (!btn) {
    return <>{Comp}</>
  }
  //当前界面没有按钮权限数据
  if (Object.keys(BUTTONS).length == 0) {
    return null

  }
  if (BUTTONS && BUTTONS.includes(btn) && Comp) {
    return <>{Comp}</>
  }
  return null


}

export default ButtonPer