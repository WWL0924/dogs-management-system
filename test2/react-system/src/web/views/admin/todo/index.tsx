import { Alert, Row, Col, Card, Table } from 'antd'
import { useEffect, useState } from 'react'
import type { Dog, Complaint } from '@/types/domain'
import { apiJson } from '@/api'

const Todo = () => {
  //待审核犬只数据
  const [dogData, setDogData] = useState<Dog[]>([])
  //待处理投诉数据
  const [compData, setCompData] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const fetchDogData = async () => {
    const data = await apiJson<Dog[]>('/api/dogs?status=0')
    //只能显示对应用户的犬只
    const userDogs = data.filter((item: Dog) => item.status === 0)
    console.log('#获取待审核犬只数据', userDogs)
    setDogData(userDogs)
  }

  const fetchComp = async () => {
    const data = await apiJson<Complaint[]>('/api/complaints?status=0')
    //只能显示对应用户的投诉
    const userComps = data.filter((item: Complaint) => item.status === 0)
    console.log('#获取待处理投诉数据', userComps)
    setCompData(userComps)
  }

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => Promise.allSettled([fetchDogData(), fetchComp()])).then((results) => {
      if (!active) return
      const failed = results.find((result) => result.status === 'rejected')
      if (failed?.status === 'rejected') {
        setError(failed.reason instanceof Error ? failed.reason.message : '待办数据加载失败')
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  //犬只配置
  const dogColumns = [
    // 这里第一列应该是递增数据
    // { title: '序号', dataIndex: 'index', key: 'index' },
    { title: '主人姓名', dataIndex: 'masterName', key: 'masterName' },
    { title: '宠物狗姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'sex', key: 'sex' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
  ]
  //投诉配置
  const compColumns = [
    { title: '主人姓名', dataIndex: 'name', key: 'name' },
    { title: '投诉内容', dataIndex: 'content', key: 'content' },
    { title: '投诉时间', dataIndex: 'time', key: 'time' },
  ]
  return (
    // gutter={16} 表示左右两个模块中间有 16px 的间隙
    <div className="page-container">
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Row gutter={[16, 16]}>
        {/* 左侧模块：span={12} 表示占一半宽度 */}
        <Col xs={24} xl={12}>
          <Card title='待审核犬只' bordered={false}>
            <Table rowKey="id" loading={loading} dataSource={dogData} columns={dogColumns} scroll={{ x: 520 }}></Table>
          </Card>
        </Col>

        {/* 右侧模块：span={12} 表示占一半宽度 */}
        <Col xs={24} xl={12}>
          <Card title='待处理投诉' bordered={false}>
            {/* TODO: 待处理投诉列表 */}

            <Table rowKey="id" loading={loading} dataSource={compData} columns={compColumns} scroll={{ x: 520 }}></Table>

          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Todo
