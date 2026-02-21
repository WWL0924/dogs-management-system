import { Button, Checkbox, DatePicker, Form, Input, Select, Space } from "antd"
import { forwardRef } from "react"

interface FormGeneratorProps {
  config: FormConfigItem[],
  values?: any,
  ref?: any,
  //是否有按钮
  isBtn?: boolean,
  //按钮字段
  confirmText?: string,
  //按钮功能
  handelBtn?: (values: any) => void,
}

//React.FC函数组件类型
//props 的类型是 FormGeneratorProps
const SearchForm: React.FC<FormGeneratorProps> = forwardRef(({
  //配置数组
  config,
  //默认值
  values,
  //是否有按钮功能
  isBtn = false,
  //按钮字段
  confirmText,
  //按钮功能
  handelBtn
}, ref) => {

  const renderFormItem = (item: FormConfigItem) => {
    switch (item.type) {
      case 'input':
        return <Input placeholder={item.placeholder} type='input' />
      case 'select':
        return (
          <Select placeholder={item.placeholder}>
            {item.options?.map((option) => (
              // 是Select的子组件
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )
      case 'checkbox':
        return (
          <Checkbox.Group options={item.options} />
        )
      case 'datepicker':
        return (
          <DatePicker placeholder={item.placeholder} />
        )
    }
  }
  return (
    <>
      <Form
        className='formGenerator'
        ref={ref}
      >
        {
          // 父组件作为props传入config
          config.map((item) => ( //直接return
            <Form.Item
              key={item.name} label={item.label} name={item.name}
              //必填项
              rules={[{ required: true, message: '请输入' + item.label }]}
            >
              {renderFormItem(item)}
            </Form.Item>

          ))
        }
        {/* 添加查询按钮 */}
        {isBtn && (
          <Form.Item>
            <Space>
              {/* 查询 提交之后自动调用onFinish*/}
              <Button type="primary" onClick={handelBtn}>{confirmText}</Button>
            </Space>
          </Form.Item>
        )}

      </Form>
    </>
  )
})

export default SearchForm