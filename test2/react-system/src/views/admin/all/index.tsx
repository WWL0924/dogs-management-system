import { Button, Form, Input, Radio, Table } from "antd";
import { useEffect, useState } from "react";

const Review = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  //获取所有犬只信息
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/dogs');
      const data = await response.json();
      console.log('#所有数据', data)
      setAllData(data);
      setFilteredData(data)
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  //组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, []);
  //查询功能
  const handleSearch = async (values) => {
    console.log('#得到的查询数据', values)
    if (!values) {
      setFilteredData(allData)
    }
    else {
      //根据查询条件筛选数据
      const filteredData = allData.filter((item) => {
        // console.log('#是否接种疫苗的筛选', values.vaccine, 'item.vaccine', item.vaccine)
        return (
          //只筛选填入的条件
          (!values.masterName || item.masterName.includes(values.masterName)) &&
          (!values.name || item.name.includes(values.name)) &&
          (!values.breed || item.breed.includes(values.breed)) &&
          (values.vaccine === undefined || item.vaccine === values.vaccine)
        )
      })
      console.log('#筛选后的数据', filteredData)
      setFilteredData(filteredData)
    }


  };
  //表单配置
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '主人姓名', dataIndex: 'masterName', key: 'masterName' },
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
    <div>
      {/* 筛选 */}
      {/* 查询*/}
      <Form layout='inline' onFinish={handleSearch}>
        <Form.Item name="masterName" label="主人姓名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="name" label="犬名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="breed" label="品种">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="vaccine" label="是否接种疫苗">
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
            <Radio value={undefined}>全部</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">筛选</Button>
        </Form.Item>
      </Form>
      <Table dataSource={filteredData} columns={columns} ></Table>

    </div>
  )
}

export default Review
