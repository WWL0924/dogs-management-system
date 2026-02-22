import { Button, Modal, Table } from "antd"
import { useEffect, useState } from "react"
import complainConfig from "./config"
import FormGenerator from "@/components/formGenerator"
import { useRef } from "react"
import { connect } from 'react-redux';
import dayjs from "dayjs";

//投诉与举报：遛狗不牵绳、不清理粪便等
const Complain = (props: any) => {
  //获取用户名
  const { name } = props
  const [complainData, setComplainData] = useState([])
  const [visible, setVisible] = useState(false)
  const form = useRef<any>(null)

  //表格数据
  const fetchDate = async () => {
    const res = await fetch('http://localhost:4000/complain')
    const result = await res.json()
    const data = result.filter((item: any) => item.name === name)
    console.log('#获取表格数据', data)
    return data
  }
  //使用useEffect钩子函数获取数据
  useEffect(() => {
    fetchDate().then(data => {
      setComplainData(data)
    })
  }, [])

  //新增投诉
  const handelComp = () => {
    setVisible(true)
  }

  //弹窗里的ok
  const handleOk = () => {
    form.current.validateFields().then((values: any) => {
      // 处理时间格式
      if (values.time) {
        values.time = dayjs(values.time).format('YYYY-MM-DD')
      }
      console.log('#投诉表单的时间', values.time)
      setVisible(false)
      // 提交数据到后端 这里还包括添加用户姓名和状态
      fetch('http://localhost:4000/complain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          name: name,
          status: false
        }),
      }).then(res => res.json()).then(data => {
        console.log('#新增投诉', data)
        // 刷新数据
        fetchDate().then(data => {
          setComplainData(data)
          // 刷新数据后，弹窗关闭
          setVisible(false)
        })
      })
    })
  }
  //未处理的数据的删除操作
  const handelEdit = (record: any) => {
    // 发送删除请求到后端
    fetch(`http://localhost:4000/complain/${record.id}`, {
      method: 'DELETE',
    }).then(res => res.json()).then(data => {
      console.log('#删除投诉', data)
      // 刷新数据
      fetchDate().then(data => {
        setComplainData(data)
      })
    })
  }
  //表格配置
  const columns = [
    { title: '投诉内容', dataIndex: 'content', key: 'content' },
    { title: '投诉时间', dataIndex: 'time', key: 'time' },
    { title: '投诉人', dataIndex: 'name', key: 'name' },
    {
      title: '处理状态', dataIndex: 'status', key: 'status',
      render: (status: boolean) => (status ? '已处理' : '未处理'),
    },
    {
      title: '操作', dataIndex: 'operation', key: 'operation',
      render: (status: boolean, record: any) => {
        if (record.status) {
          return null
        } else {
          return (
            <div>
              <Button type="primary" onClick={() => handelEdit(record)}>删除</Button>
            </div >
          )
        }
      },
    },
  ]
  return (

    <div>
      {/* 新增投诉 */}
      <div>
        <Button type="primary" onClick={handelComp}>新增投诉</Button>
      </div>
      <Modal
        title="新增投诉"
        open={visible}
        // 这里的按钮是弹窗自带的
        onOk={handleOk}
        onCancel={() => setVisible(false)}
      >
        <FormGenerator
          config={complainConfig}
          //父组件可以访问子组件实例
          ref={form}
          isBtn={false}
        ></FormGenerator>
      </Modal>
      <Table
        columns={columns}
        dataSource={complainData}
      />
    </div>
  )
}
const mapStateToProps = (state: any) => {
  return {
    name: state.global.userInfo?.name || '' // 必须取出 name
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, null)(Complain)
