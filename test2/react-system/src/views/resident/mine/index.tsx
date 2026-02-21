import ButtonPer from "@/components/ButtonPer";
import { Button, Form, Input, Modal, Table } from "antd";
import { mineConfig } from './config'
import FormGenerator from "@/components/formGenerator";
import { useRef, useState } from "react";

function Home() {
  const data = [
    {
      key: 1,
      name: '小a',
      breed: '柴犬',
      sex: '雄性',
      age: '3',
      vaccine: true,
    },
    {
      key: 2,
      name: '小b',
      breed: '金毛',
      sex: '雌性',
      age: '3',
      vaccine: true,
    },
  ]
  //列表数据
  const [tableData, setTableData] = useState(data)
  //页面数据
  const [mineData, setMineData] = useState(data)
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
  const mapFormValues = (values: any) => {
    return {
      key: mineData.length + 1,
      name: values.name,
      breed: values.breed,
      sex: values.sex,
      age: values.age,
      vaccine: values.vaccine,
    }
  }
  //新增功能
  const handleAdd = () => {
    setVisible(true)
  }

  //弹窗内按钮 这里可能要写useEffect
  const handleOk = () => {
    form.current.validateFields().then((values) => {
      console.log('校验通过', values)
      setVisible(false)
      //表单的值
      const formvalues = form.current.getFieldsValue()
      console.log('当前输入的值', formvalues)
      //再把弹窗里面的内容给给Table 这里需要再处理一下 只把一部分显示出来
      setMineData([...mineData, mapFormValues(formvalues)])
      setTableData([...tableData, mapFormValues(formvalues)])
      console.log('新增之后的数据', mineData)
    })
      .catch((error) => {
        console.log('校验失败', error)
      })
  }



  //配置
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

export default Home