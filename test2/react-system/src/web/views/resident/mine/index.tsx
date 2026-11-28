
import { Button, Form, Input, message, Modal, Table, type FormInstance } from "antd";
import { mineConfig } from './config'
import FormGenerator from "@/components/formGenerator";
import { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import type { RootState } from '@/redux/interface'
import type { Dog } from '@/types/domain'
import { apiJson } from '@/api'


function Home(props: { name: string }) {
  //列表数据
  const [tableData, setTableData] = useState<Dog[]>([])
  //页面数据
  const [mineData, setMineData] = useState<Dog[]>([])
  //获取当前登录的用户账号
  const { name } = props
  console.log('当前登录的用户账号', name)


  //从mock获取数据并且更新data
  const fetchData = useCallback(async () => {
    try {
      const data = await apiJson<Dog[]>('/api/dogs')
      console.log('从mock中获取的相应用户的犬只', data)
      setMineData(data)
      setTableData(data)
    }
    catch (error) {
      console.log('从mock获取数据失败', error)
      message.error(error instanceof Error ? error.message : '犬只列表加载失败')
    }
  }, [])

  //渲染完毕后获取数据?
  useEffect(() => {
    if (name) {
      void Promise.resolve().then(fetchData)
    }
  }, [name, fetchData])


  //查询功能
  const handleSearch = (values: { name?: string; breed?: string }) => {
    console.log('点击查询按钮表单值', values)
    if (!values) {
      setTableData(tableData)
    }
    else {
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


  }

  //弹窗是否可见
  const [visible, setVisible] = useState(false)
  const form = useRef<FormInstance>(null)


  //新增功能
  const handleAdd = () => {
    setVisible(true)
  }

  // 监听 visible 变化，当弹窗打开时自动赋值
  useEffect(() => {
    if (visible && form.current) {
      // 这里甚至不需要 setTimeout，因为 useEffect 执行时 DOM 已经更新
      form.current.setFieldsValue({
        masterName: name,
      })
    }
  }, [visible, name]) // 依赖 visible 和 name
  const handleOk = () => {
    // 1. 校验表单
    form.current.validateFields().then(async (values) => {

      // 2. 发送 POST 请求
      await apiJson<Dog>('/api/dogs', {
        method: 'POST', // 指定方法
        headers: {
          'Content-Type': 'application/json' // 告诉后端发的是 JSON
        },
        body: JSON.stringify({ ...values, status: 0 }) // 把对象转成 JSON 字符串
      });
      // 3. 后续操作
      setVisible(false); // 关弹窗
      await fetchData(); // 刷新列表 (去拿最新数据)

    }).catch((error) => {
      console.log('校验失败或请求失败', error);
      if (!(error && typeof error === 'object' && 'errorFields' in error)) {
        message.error(error instanceof Error ? error.message : '新增犬只失败')
      }
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
    {
      title: '信息状态', dataIndex: 'status', key: 'status'
      , render: (text) => {
        if (text === 0) { return '待审核' }
        else if (text === 1) { return '已通过' }
        else if (text === 2) { return '已拒绝' }
        else { return '未知状态' }
      }
    },
  ]
  return (
    <div className="page-container">
      {/* 查询*/}
      <Form layout='inline' onFinish={handleSearch} className="search-form">
        <Form.Item name="name" label="犬名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="breed" label="品种">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">查询</Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAdd}>新增犬只</Button>
        </Form.Item>
      </Form>
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
const mapStateToProps = (state: RootState) => {
  return {
    name: state.global.userInfo?.name || '' // 必须取出 name
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, null)(Home)
