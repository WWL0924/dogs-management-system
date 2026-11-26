import FormGenerator from "@/components/formGenerator"
import { complainConfig } from "@/views/resident/complain/config"
import { Button, Input, message, Modal, Table, type FormInstance } from "antd"
import dayjs from "dayjs"
import { useEffect, useRef, useState } from "react"
import type { Complaint } from '@/types/domain'
import { apiFetch } from '@/api'


const Deal = () => {
  const [visible, setVisible] = useState(false)
  //获取投诉数据
  const [dealData, setDealData] = useState<Complaint[]>([])
  // 当前处理的投诉记录
  const [currentId, setCurrentId] = useState(null)
  const [handlingResult, setHandlingResult] = useState('')

  //处理投诉弹窗表单实例
  const form = useRef<FormInstance>(null)


  const fetchData = async () => {
    const res = await apiFetch('/api/complaints?status=0')
    const result = await res.json()
    const data = result.filter((item: Complaint) => item.status === 0)
    console.log('#获取未处理的投诉数据', data)
    setDealData(data)
  }
  useEffect(() => {
    void Promise.resolve().then(fetchData)

  }, [])


  //处理
  const handleDeal = (record: Complaint) => {
    console.log('#当前投诉数据', record.id)
    setCurrentId(record.id)
    setHandlingResult('')
    setVisible(true)
    const formdata = {
      ...record,
      time: dayjs(record.time)
    }
    // 使用 setTimeout 确保 Form 实例已经挂载
    setTimeout(() => {
      if (form.current) {
        form.current.setFieldsValue(formdata)
      }
    }, 0)
  }
  //点击ok表示审核通过
  const handleOk = async () => {
    try {
      if (!handlingResult.trim()) {
        message.error('请填写处理结果')
        return
      }
      //获取表单数据
      await form.current.validateFields()
      // 发送请求更新数据
      const res = await apiFetch(`/api/complaints/${currentId}/handle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 1, handlingResult })
      })
      if (res.ok) {
        console.log('#更新成功')
        // 更新成功后刷新数据
        fetchData()
        setVisible(false)
      }
    } catch (error) {
      console.error('更新数据失败:', error);
    }
  }
  //点击 驳回
  const handleCancel = async () => {
    await form.current.validateFields()
    if (!handlingResult.trim()) {
      message.error('请填写驳回原因')
      return
    }

    try {
      // 发送请求更新数据
      const res = await apiFetch(`/api/complaints/${currentId}/handle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 2, handlingResult })
      })
      if (res.ok) {
        console.log('#更新成功')
        // 更新成功后刷新数据
        fetchData()
        setVisible(false)
      }
    } catch (error) {
      console.error('更新数据失败:', error);
    }
  }

  //关闭弹窗
  const handleClose = () => {
    setVisible(false)
  }

  //生成器配置
  const dealConfig = complainConfig.map((item) => ({
    ...item,
    disabled: true
  }))
  //表格配置
  const columns = [
    { title: '投诉内容', dataIndex: 'content', key: 'content' },
    { title: '投诉时间', dataIndex: 'time', key: 'time' },
    { title: '投诉人', dataIndex: 'name', key: 'name' },
    {
      title: '操作', dataIndex: 'operation', key: 'operation',
      render: (_status: boolean, record: Complaint) => {
        if (record.status) {
          return null
        } else {
          return (
            <div>
              <Button type="primary" onClick={() => handleDeal(record)}>处理</Button>
            </div >
          )
        }
      },
    },
  ]
  return (
    <div className="page-container">
      <Table columns={columns} dataSource={dealData} />


      <Modal
        title="投诉详情"
        open={visible}
        // 这里的按钮是弹窗自带的
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleCancel}>
            审核不通过
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            审核通过
          </Button>,
        ]}
      >
        <FormGenerator
          config={dealConfig}
          isrequired={false}
          //父组件可以访问子组件实例
          ref={form}
          isBtn={false}
        ></FormGenerator>
        <Input.TextArea
          value={handlingResult}
          onChange={(event) => setHandlingResult(event.target.value)}
          placeholder="处理结果或驳回原因"
          maxLength={10000}
          rows={3}
        />
      </Modal>
    </div>
  )
}

export default Deal
