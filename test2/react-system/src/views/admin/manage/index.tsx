import FormGenerator from "@/components/formGenerator";
import { mineConfig } from "@/views/resident/mine/config";
import { Button, Modal, Table } from "antd"
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";


const Manage = () => {
  const [manageData, setManageData] = useState([]);
  // 弹窗是否显示
  const [visible, setVisible] = useState(false);
  // 当前选中的犬只id
  const [currentId, setCurrentId] = useState('');
  // 表单实例
  const form = useRef<any>(null);

  //生成器配置
  const manageConfig = mineConfig.map((item) => ({
    ...item,
    disabled: true
  }))


  //获取所有犬只信息
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/dogs');
      const res = await response.json();
      console.log('#响应', res)
      const data = res.filter((item) => item.status === 0)
      console.log('#所有未审核数据', data)
      setManageData(data);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  //组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, []);

  //点击详情查看更多
  const handelMore = (record) => {
    console.log('#点击详情查看更多', record)
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


  //点击ok表示审核通过
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
        body: JSON.stringify({ status: 1, ...values })
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
    const values = await form.current.validateFields()

    try {
      // 发送请求更新数据
      const res = await fetch(`http://localhost:4000/dogs/${currentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 2, ...values })
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
      title: '详情',
      render: (record) => {
        return (
          <Button type="primary" onClick={() => handelMore(record)}>详情</Button>
        )
      }
    },
  ]
  return (
    <div>
      <Table dataSource={manageData} columns={columns} ></Table>

      <Modal
        forceRender={true}
        title="编辑犬只"
        open={visible}
        // 这里的按钮是弹窗自带的
        onOk={handleOk}
        onCancel={handleCancel}
        okText="审核通过"
        cancelText="驳回"
      >
        <FormGenerator
          // 这里config要变成所有内容不可变
          config={manageConfig}
          //父组件可以访问子组件实例
          ref={form}
          isBtn={false}
        ></FormGenerator>
      </Modal>
    </div>
  )
}

export default Manage
