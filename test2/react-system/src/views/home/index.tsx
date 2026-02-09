import ButtonPer from "@/components/ButtonPer";
import { Button } from "antd";
import { formConfig } from './config'
import FormGenerator from "@/components/formGenerator";

function Home() {
  return (
    <div>
      <h1>home</h1>
      {/* 应用组件 */}
      <ButtonPer
        btn={'add'}
        Comp={
          <Button type="primary">添加</Button>
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
      >
      </FormGenerator>
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