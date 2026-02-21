import ButtonPer from "@/components/ButtonPer";
import { Button, Form, Input, Modal, Table } from "antd";
import { mineConfig } from './config'
import FormGenerator from "@/components/formGenerator";
import { useEffect, useRef, useState } from "react";
import type { access } from "fs";
import { connect } from "react-redux";


function Home(props: any) {
  //列表数据
  const [tableData, setTableData] = useState([])
  //页面数据
  const [mineData, setMineData] = useState([])
  //获取当前登录的用户账号
  const { account } = props
  console.log('当前登录的账号', account)
  //当前登录的用户名
  const [userName, setUserName] = useState('用户')

  //根据accout 获取相应的name
  const fetchName = async () => {
    try {
      const res = await fetch('http://localhost:4000/resident')
      const data = await res.json()
      console.log('从mock中获取的用户信息', data)
      const name = data.find((item: any) => item.account === account)?.name || '用户'
      console.log('从mock中获取的用户名', name)
      return name
    }
    catch (error) {
      console.log('从mock中获取用户名失败', error)
    }
  }

  //从mock获取数据并且更新data
  const fetchData = async (name: string) => {
    try {
      const res = await fetch('http://localhost:4000/dogs')
      const result = await res.json()
      const targetName = name || userName

      const data = result.filter((item: any) => item.masterName === targetName)
      console.log('fetchDate方法从mock获取的相应用户的犬只', result)
      setMineData(data)
      setTableData(data)
    }
    catch (error) {
      console.log('从mock获取数据失败', error)
    }
  }

  //渲染完毕后获取数据?
  useEffect(() => {
    //等名字拿到之后再存入
    const init = async () => {
      const name = await fetchName()
      console.log('从mock中获取的用户名', name)
      setUserName(name)//这里是异步的 稍后执行
      fetchData(name)
    }
    init()
  }, [])


  //查询功能
  const handleSearch = (values: any) => {
    console.log('点击查询按钮表单值', values)
    if (values) {
      //根据查询条件筛选数据
      const filteredData = mineData.filter((item) => {
        return (
          //只筛选填入的条件
          (!values.name || item.name.includes(values.name)) &&
          (!values.breed || item.breed.includes(values.breed))
        )
      })
      console.log('筛选后的数据', filteredData)
      setTableData(filteredData)
      console.log('筛选后的数据', tableData)
    }
    //没有数据 点击自动渲染
    //这里怎么在清空之后 显示之前的所有数据
    else {
      setTableData(tableData)
    }


  }

  //弹窗是否可见
  const [visible, setVisible] = useState(false)
  const form = useRef(null)
  // const mapFormValues = (values: any) => {
  //   return {
  //     key: mineData.length + 1,
  //     name: values.name,
  //     breed: values.breed,
  //     sex: values.sex,
  //     age: values.age,
  //     vaccine: values.vaccine,
  //   }
  // }
  //新增功能
  const handleAdd = () => {
    setVisible(true)
    setTimeout(() => {
      // 使用可选链防止报错
      form.current?.setFieldsValue({
        masterName: userName,
      })
    })
  }

  const handleOk = () => {
    // 1. 校验表单
    form.current.validateFields().then(async (values) => {

      // 2. 发送 POST 请求
      await fetch('http://localhost:4000/dogs', {
        method: 'POST', // 指定方法
        headers: {
          'Content-Type': 'application/json' // 告诉后端发的是 JSON
        },
        body: JSON.stringify(values) // 把对象转成 JSON 字符串
      });
      // 3. 后续操作
      console.log('handleOk方法提交的数据', values);
      setVisible(false); // 关弹窗
      fetchData(); // 刷新列表 (去拿最新数据)

    }).catch((error) => {
      console.log('校验失败或请求失败', error);
    });
  };



  //配置 这里不需要清洗数据
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'breed', key: 'breed' },
    { title: '性别', dataIndex: 'sex', key: 'sex' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    {
      title: '是否接种疫苗', dataIndex: 'vaccine', key: 'vaccine'
      , render: (text) => text ? '是' : '否'
    },
  ]
  return (
    <div>
      <h1>我的犬只</h1>
      {/* 查询*/}
      <Form layout='inline' onFinish={handleSearch}>
        <Form.Item name="name" label="犬名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="breed" label="品种">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">查询</Button>
        </Form.Item>
      </Form>
      <Button type="primary" onClick={handleAdd}>新增犬只</Button>
      {/* 点击新增之后生成弹窗 */}
      <Modal
        title="新增犬只"
        open={visible}
        // 这里的按钮是弹窗自带的
        onOk={handleOk}
        onCancel={() => setVisible(false)}
      >
        <FormGenerator
          config={mineConfig}
          //父组件可以访问子组件实例
          ref={form}
          isBtn={false}
        ></FormGenerator>
      </Modal>
      {/* 列表渲染  这里面写编辑*/}
      <Table dataSource={tableData} columns={columns} ></Table>

    </div >
  )


}
const mapStateToProps = (state: any) => {
  return {
    account: state.global.userInfo?.account || '' // 必须取出 account
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, null)(Home)
