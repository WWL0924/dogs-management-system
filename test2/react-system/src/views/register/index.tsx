import { Button, Input, Card, Form, Typography, Space, Select } from "antd";
import { setToken } from "@/redux/module/global/action";
//返回包装后的组件
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
//下拉菜单
import { Dropdown } from 'antd';

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
            name="name"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="用户名" />
          </Form.Item>
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
          {/* 下拉菜单选择身份 */}
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
              //
              onChange={(val) => console.log(val)}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: '32px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button block type="primary" htmlType="submit">
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
const mapDispatchToProps = { setToken }

//返回可以直接通过props调用dispatch的组件
export default connect(null, mapDispatchToProps)(Register)
