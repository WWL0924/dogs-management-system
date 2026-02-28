import { Button, Input, Card, Form, Typography, Select } from "antd";
import { setToken } from "@/redux/module/global/action";
//返回包装后的组件
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
//下拉菜单
// import { Dropdown } from 'antd';
import '../Login/index.less' // 复用登录页样式

const { Title, Text } = Typography;


const Register = () => {
  //定义跳转
  const navigate = useNavigate()
  //获取表单实例对象
  const [form] = Form.useForm()


  //输入完毕获取数据
  const handleFinish = async (values: any) => {
    //获取账号密码
    const { account, password, role, name } = values
    console.log(account, password, role, name)
    //存入json
    const http = 'http://localhost:4000' + '/' + role
    //查重
    // 1. 查重
    const checkRes = await fetch(`http://localhost:4000/${role}?account=${account}`)
    const checkData = await checkRes.json()

    if (checkData.length > 0) {
      alert('账号已存在！') // 或者用 message.error
      //清空输入框 
      form.resetFields()
      return // 只要这里 return 了，下面就不会执行了
    }

    // 注册功能
    fetch(http, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account, password, role, name }),
    })
    navigate('/login')
  }

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <Title level={2}>幸福社区</Title>
          <Text type="secondary">用户注册</Text>
        </div>

        <Form layout="vertical" size="large" onFinish={handleFinish} form={form}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
          </Form.Item>
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
          {/* 下拉菜单选择身份 */}
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
            <Button type="primary" block htmlType="submit">
              立即注册
            </Button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="link" onClick={() => navigate('/login')}>
                已有账号？去登录
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

//操作action通过dispath 组件里不用自己调用 dispatch 直接调用 props 方法就行
const mapDispatchToProps = { setToken }

//返回可以直接通过props调用dispatch的组件
export default connect(null, mapDispatchToProps)(Register)
