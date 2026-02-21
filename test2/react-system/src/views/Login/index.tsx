import { Button, Input, Card, Form, Typography, Space, Dropdown, Select, message } from "antd";
import { setToken, setUserInfo } from "@/redux/module/global/action";
//返回包装后的组件
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect } from "react";

const { Title, Text } = Typography;



interface LoginProps {
  setToken: typeof setToken
  setUserInfo: typeof setUserInfo,
  token: string,
  role: string,
}


const Login = (props: LoginProps) => {
  //从props取出setToken方法
  const { setToken, setUserInfo, token, role } = props
  //定义跳转
  const navigate = useNavigate()
  //获取表单实例对象
  const [form] = Form.useForm()

  //输入完毕获取数据
  const handleFinish = async (values: any) => {
    const { role, account, password } = values
    //登录校验功能
    const http = 'http://localhost:4000' + '/' + role
    const roleData = async () => {
      const res = await fetch(http)
      const data = await res.json()
      console.log('mock拿到后端数据', data)
      return data
    }
    //判断账号密码是否匹配
    const user = await roleData().then((data: any) => data.find((item: any) => item.account === account && item.password === password))
    console.log('账号密码是否匹配', user)
    if (user) {
      //存入store
      setUserInfo({ role, account })
      //路由守卫
      setToken('login')
    } else {
      alert('账号或密码错误')
      //清空输入框 
      form.resetFields()
    }
  }


  //首次渲染完成和这些值变化的时候触发
  //等待token真的变化之后再跳转
  useEffect(() => {
    if (!token || !role) return
    if (role === 'resident') {
      navigate('/resident')
    }
    if (role === 'admin') {
      navigate('/admin')
    }
  }, [token, role, navigate])


  //注册功能
  const handleRegister = () => {
    console.log('register')
    //跳转到注册页面
    navigate('/register')

  }


  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f6ffed 0%, #d9f7be 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        style={{
          width: 400,
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          padding: '20px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>幸福社区</Title>
          <Text type="secondary">宠物狗管理系统</Text>
        </div>

        <Form layout="vertical" size="large" onFinish={handleFinish} form={form}>
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="账号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择身份' }]}
          >
            <Select style={{ width: '100%' }} placeholder="选择身份" options={[
              {
                label: '用户',
                value: 'resident',
              },
              {
                label: '管理员',
                value: 'admin',
              },
            ]}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: '32px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button type="primary" block htmlType="submit">
                登录
              </Button>
              <Button block onClick={handleRegister}>
                注册账号
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div >
  )
}

//操作action通过dispath 组件里不用自己调用 dispatch 直接调用 props 方法就行
const mapDispatchToProps = { setToken, setUserInfo }
const mapStateToProps = (state: any) => {
  return {
    token: state.global.token,
    role: state.global.userInfo?.role || '' // 必须取出 role 
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, mapDispatchToProps)(Login)
