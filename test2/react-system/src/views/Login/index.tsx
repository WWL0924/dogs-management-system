import { Button, Input } from "antd";
import { Form } from 'antd';
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
    //这里应该获取账号密码和身份
    console.log('login')
   
    //跳转功能
    //这里是点击登录之后都要进入初始化页面么
    navigate('/loading')
  }
  //注册功能
  const handleRegister = () => {
    console.log('register')
     //更新state.token
    setToken('token')
    console.log()
    //这里怎么保存身份
    
  }

  return (
    <>
      <Form>
        <Form.Item name="username" label="用户名">
          <Input />
        </Form.Item>
        <Form.Item name="password" label="密码">
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleLogin}>登录</Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleRegister}>注册</Button>
        </Form.Item>
      </Form>
    </>
  )
}

//操作action通过dispath 组件里不用自己调用 dispatch 直接调用 props 方法就行
const mapDispatchToProps = { setToken }

//返回可以直接通过props调用dispatch的组件
export default connect(null, mapDispatchToProps)(Login)
