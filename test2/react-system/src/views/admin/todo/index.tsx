import { Row, Col, Card, Table } from 'antd'
import { useEffect, useState } from 'react'

const Todo = () => {
  //待审核犬只数据
  const [dogData, setDogData] = useState([])
  //待处理投诉数据
  const [compData, setCompData] = useState([])


  const fetchDogData = async () => {
    const res = await fetch('http://localhost:4000/dogs')
    const data = await res.json()
    //只能显示对应用户的犬只
    const userDogs = data.filter((item: any) => item.status === 0)
    console.log('#获取待审核犬只数据', userDogs)
    setDogData(userDogs)
  }

  const fetchComp = async () => {
    const res = await fetch('http://localhost:4000/complain')
    const data = await res.json()
    //只能显示对应用户的投诉
    const userComps = data.filter((item: any) => item.status === false)
    console.log('#获取待处理投诉数据', userComps)
    setCompData(userComps)
  }

  useEffect(() => {
    fetchDogData()
    fetchComp()
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
    <Row gutter={16}>
      {/* 左侧模块：span={12} 表示占一半宽度 */}
      <Col span={12}>
        <Card title='待审核犬只' bordered={false}>
          <Table dataSource={dogData} columns={dogColumns} ></Table>
        </Card>
      </Col>

      {/* 右侧模块：span={12} 表示占一半宽度 */}
      <Col span={12}>
        <Card title='待处理投诉' bordered={false}>
          {/* TODO: 待处理投诉列表 */}

          <Table dataSource={compData} columns={compColumns} ></Table>

        </Card>
      </Col>
    </Row>
  )
}

export default Todo