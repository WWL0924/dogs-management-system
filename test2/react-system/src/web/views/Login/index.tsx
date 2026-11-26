import { Button, Input, Card, Form, Typography, Space, Select } from "antd";
import { setToken, setUserInfo } from "@/redux/module/global/action";
//返回包装后的组件
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect } from "react";
import type { RootState, UserInfo } from '@/redux/interface';
import { apiFetch } from '@/api';

type LoginValues = Pick<UserInfo, 'role' | 'account'> & { password: string }
type LoginUser = UserInfo & { id: number }

const { Title, Text } = Typography;



interface LoginProps {
  setToken: typeof setToken
  setUserInfo: typeof setUserInfo,
  token: string,
  role: string,
}


import './index.less'

const Login = (props: LoginProps) => {
  //从props取出setToken方法
  const { setToken, setUserInfo, token, role } = props
  //定义跳转
  const navigate = useNavigate()
  //获取表单实例对象
  const [form] = Form.useForm()

  //输入完毕获取数据
  const handleFinish = async (values: LoginValues) => {
    const { role, account, password } = values
    //登录校验功能
    const http = '/api/auth/login'
    const roleData = async () => {
      const res = await apiFetch(http, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, account, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || '登录失败')
      return data
    }
    //判断账号密码是否匹配
    let result: { user: LoginUser; token: string }
    try {
      result = await roleData()
    } catch (error) {
      alert(error instanceof Error ? error.message : '登录失败')
      return
    }
    const user = result.user

    if (user) {
      console.log('相应数据的用户名存入store', user.name)
      const name = user.name
      //存入store
      setUserInfo({ role, account, name })
      //路由守卫
      setToken(result.token)
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
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <Title level={2}>幸福社区</Title>
          <Text type="secondary">宠物狗管理系统</Text>
        </div>

        <Form layout="vertical" size="large" onFinish={handleFinish} form={form}>
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="账号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择身份' }]}
          >
            <Select placeholder="选择身份" options={[
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
          <Form.Item className="form-actions">
            <Space direction="vertical" size="middle">
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
const mapStateToProps = (state: RootState) => {
  return {
    token: state.global.token,
    role: state.global.userInfo?.role || '' // 必须取出 role 
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, mapDispatchToProps)(Login)
