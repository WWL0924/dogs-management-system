import FormGenerator from "@/components/formGenerator"
import { Button, Modal, Table } from "antd"
import { useEffect, useRef, useState } from "react"
//生成器配置
const mineConfig = [
  {
    label: 'ID',
    name: 'id',
    type: 'input',
    placeholder: '请输入ID'
  },
  {
    label: '姓名',
    name: 'name',
    type: 'input',
    placeholder: '请输入姓名'
  },
  {
    label: '性别',
    name: 'sex',
    type: 'select',
    options: [
      { label: '雄性', value: '雄性' },
      { label: '雌性', value: '雌性' }
    ]
  },
  {
    label: '年龄',
    name: 'age',
    type: 'input',
    placeholder: '请输入年龄'
  },
  {
    label: '品种',
    name: 'breed',
    type: 'input',
    placeholder: '请输入品种'
  }
]

// 修复表单配置类型
// const fixedMineConfig = mineConfig.map((item: any) => ({
//   ...item,
//   type: item.type as const
// }))
import { connect } from "react-redux"
import dayjs from "dayjs"
const Details = (props: any) => {
  //列表数据
  const [detailData, setDetailData] = useState([]) // 犬只数据
  const [visible, setVisible] = useState(false) //弹窗是否可见
  const form = useRef(null)
  //存入当前id
  const [currentId, setCurrentId] = useState('') // 当前编辑的id
  //获取用户名
  const { name } = props

  const fetchData = async () => {
    const res = await fetch('http://localhost:4000/dogs')
    const data = await res.json()
    //只能显示对应用户的犬只
    const userDogs = data.filter((item: any) => item.masterName === name)
    setDetailData(userDogs)
  }
  useEffect(() => {
    fetchData()
  }, [])



  //点击编辑
  const handelEdit = async (record: any) => {
    console.log('#这一行的列表', record)
    // 存储当前id
    setCurrentId(record.id)
    setVisible(true);
    // 等待 Modal 渲染完成后再填充数据
    setTimeout(() => {
      const formData = { ...record }
      //处理数据
      if (formData.record) {
        formData.record = dayjs(formData.record) //日期
        formData.sex = formData.sex === '女' ? '雌性' : '雄性' //性别
        // formData.vaccine = formData.vaccine === true ? '是' : '否' //疫苗
      }
      form.current.setFieldsValue(formData)
    })
  }

  //弹窗内的ok
  const handleOk = async () => {
    try {
      //获取表单数据
      const values = await form.current.validateFields()
      console.log('#表单数据', values)
      // 发送请求更新数据
      const res = await fetch(`http://localhost:4000/dogs/${currentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      if (res.ok) {
        console.log('#更新成功')
        // 更新成功后刷新数据
        fetchData()
        setVisible(false)
      } else {
        console.error('更新失败')
      }
    } catch (error) {
      console.error('验证失败', error)
    }
  }
  //列表渲染的配置项
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'breed', key: 'breed' },
    { title: '性别', dataIndex: 'sex', key: 'sex' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    {
      title: '是否接种疫苗', dataIndex: 'vaccine', key: 'vaccine'
      , render: (text: boolean) => text ? '是' : '否'
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
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="primary" size="small" onClick={() => handelEdit(record)}>
          编辑
        </Button >
      )
    }
  ]
  return (
    <div className="page-container">
      {/* 列表渲染  这里面写编辑*/}
      <Table dataSource={detailData} columns={columns} rowHoverable={true}></Table>

      {/* 点击编辑之后 出现弹窗显示详细信息 */}
      {/* 点击新增之后生成弹窗 */}
      <Modal
        forceRender={true}
        title="编辑犬只"
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
    </div >
  )
}

const mapStateToProps = (state: any) => {
  return {
    name: state.global.userInfo?.name || '' // 必须取出 name
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, null)(Details)