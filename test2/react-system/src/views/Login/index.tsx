import { Button } from "antd";
import { setToken } from "@/redux/module/global/action";
//返回包装后的组件
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  setToken: typeof setToken
}


const Login = (props: LoginProps) => {
  //从props取出setToken方法
  const { setToken } = props
  //定义跳转
  const navigate = useNavigate()

  //点击按钮 把token写到local storage里面
  const handleLogin = () => {
    console.log('login')
    //更新state.token
    setToken('token')
    //跳转功能
    //这里是点击登录之后都要进入初始化页面么
    navigate('/loading')
  }


  return (
    <>
      <Button
        type="primary"
        onClick={handleLogin}

      >login</Button>
    </>
  )
}

//操作action通过dispath 组件里不用自己调用 dispatch 直接调用 props 方法就行
const mapDispatchToProps = { setToken }

//返回可以直接通过props调用dispatch的组件
export default connect(null, mapDispatchToProps)(Login)
