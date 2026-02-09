import ButtonPer from "@/components/ButtonPer";
import { Button, Modal } from "antd";
import { formConfig } from './config'
import FormGenerator from "@/components/formGenerator";
import { useRef, useState } from "react";

function Home() {
  const handleFinish = (values: any) => {
    console.log('表单值', values)
  }

  const handleRest = () => {
    console.log('reset')
  }

  //弹窗
  const [visible, setVisible] = useState(false)
  //这是一个什么样的钩子呢
  const form = useRef(null)
  const handleOk = () => {
    setVisible(false)
    //表单的值
    //getFieldsValue这是干啥的
    const formvalues = form.current.getFieldsValue()
    console.log('表单1', formvalues)
  }
  const handleCancel = () => {
    setVisible(false)
  }
  return (
    <div>
      <h1>home</h1>
      {/* 应用组件 */}
      <ButtonPer
        btn={'add'}
        Comp={
          <Button type="primary" onClick={() => setVisible(true)}>添加</Button>
        }
      >
      </ButtonPer>
      <ButtonPer
        btn={'del'}
        Comp={
          <Button type="primary">删除</Button>
        }
      >
      </ButtonPer>
      {/* 表单生成组件的渲染 */}
      <FormGenerator
        config={formConfig}
        onFinish={handleFinish}
        onReset={handleRest}
      >
      </FormGenerator>
      {/* 弹框 */}
      <Modal
        title='表单'
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {/* 这里面的最好分开写 */}
        <FormGenerator
          //父组件传入的ref 
          ref={form}
          isDialog={false}
          config={formConfig}
          onFinish={handleFinish}
          onReset={handleRest}
        ></FormGenerator>
      </Modal>
    </div>
  )

  //formConfig
  // [
  //   {
  //     label: '姓名',
  //     name: 'name',
  //     //输入框类别
  //     type: 'input',
  //   }
  // ]
}

export default Home