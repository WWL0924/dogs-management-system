import { Button, message, Modal, Table, type FormInstance } from "antd"
import { useCallback, useEffect, useState } from "react"
import { complainConfig } from "./config"
import FormGenerator from "@/components/formGenerator"
import { useRef } from "react"
import { connect } from 'react-redux';
import dayjs from "dayjs";
import type { RootState } from '@/redux/interface'
import type { Complaint } from '@/types/domain'
import { apiFetch, apiJson } from '@/api'

//投诉与举报：遛狗不牵绳、不清理粪便等
const Complain = (props: { name: string }) => {
  //获取用户名
  const { name } = props
  const [complainData, setComplainData] = useState<Complaint[]>([])
  const [visible, setVisible] = useState(false)
  const form = useRef<FormInstance>(null)

  //表格数据
  const fetchDate = useCallback(async () => {
    const data = await apiJson<Complaint[]>('/api/complaints')
    console.log('#获取表格数据', data)
    return data
  }, [])
  //使用useEffect钩子函数获取数据
  useEffect(() => {
    fetchDate().then(data => {
      setComplainData(data)
    }).catch((error) => message.error(error instanceof Error ? error.message : '投诉列表加载失败'))
  }, [fetchDate])

  //新增投诉
  const handelComp = () => {
    setVisible(true)
  }

  //弹窗里的ok
  const handleOk = () => {
    form.current.validateFields().then((values: { time?: string }) => {
      // 处理时间格式
      if (values.time) {
        values.time = dayjs(values.time).format('YYYY-MM-DD')
      }
      console.log('#投诉表单的时间', values.time)
      // 提交数据到后端 这里还包括添加用户姓名和状态
      void apiJson<Complaint>('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          name: name,
          status: 0
        }),
      }).then(async (data) => {
        console.log('#新增投诉', data)
        // 刷新数据
        // 刷新数据后，弹窗关闭
        setVisible(false)
        try {
          setComplainData(await fetchDate())
        } catch (error) {
          message.error(error instanceof Error ? error.message : '投诉列表刷新失败')
        }
      }).catch((error) => message.error(error instanceof Error ? error.message : '新增投诉失败'))
    }).catch((error) => {
      if (!(error && typeof error === 'object' && 'errorFields' in error)) {
        message.error(error instanceof Error ? error.message : '表单校验失败')
      }
    })
  }
  //未处理的数据的删除操作
  const handelEdit = (record: Complaint) => {
    // 发送删除请求到后端
    apiFetch(`/api/complaints/${record.id}`, {
      method: 'DELETE',
    }).then(res => {
      if (!res.ok) throw new Error('撤销失败')
      console.log('#删除投诉', record.id)
      // 刷新数据
      return fetchDate().then(data => {
        setComplainData(data)
      })
    }).catch((error) => message.error(error instanceof Error ? error.message : '撤销失败'))
  }
  //表格配置
  const columns = [
    { title: '投诉内容', dataIndex: 'content', key: 'content' },
    { title: '投诉时间', dataIndex: 'time', key: 'time' },
    { title: '投诉人', dataIndex: 'name', key: 'name' },
    {
      title: '处理状态', dataIndex: 'status', key: 'status',
      render: (status: number) => {
        if (status === 0) {
          return '未处理'
        } else if (status === 1) {
          return '已处理'
        } else if (status === 2) {
          return '已驳回'
        } else {
          return '未知状态'
        }
      },
    },
    {
      title: '操作', dataIndex: 'operation', key: 'operation',
      render: (_text: unknown, record: Complaint) => {
        // 如果已经处理了，就不能删除了
        if (record.status) {
          return null
        } else {
          return (
            <Button type="primary" danger onClick={() => handelEdit(record)}>撤销</Button>
          )
        }
      },
    },
  ]
  return (
    <div className="page-container">
      <div className="table-operations">
        <Button type="primary" onClick={handelComp}>新增投诉</Button>
      </div>
      <Table dataSource={complainData} columns={columns} />

      <Modal
        title="新增投诉"
        open={visible}
        // 这里的按钮是弹窗自带的
        onCancel={() => setVisible(false)}
        onOk={handleOk}
      >
        <FormGenerator
          config={complainConfig}
          isrequired={true}
          //父组件可以访问子组件实例
          ref={form}
          isBtn={false}
        ></FormGenerator>
      </Modal>
    </div>
  )
}
const mapStateToProps = (state: RootState) => {
  return {
    name: state.global.userInfo?.name || '' // 必须取出 name
  }
}
//返回可以直接通过props调用dispatch的组件
export default connect(mapStateToProps, null)(Complain)
