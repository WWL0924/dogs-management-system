import { Button, Form, Input, Select, Space } from "antd"
import { forwardRef } from "react"

interface FormGeneratorProps {
  config: FormConfigItem[],
  onFinish?: (values: any) => void,
  onReset?: () => void,
  values?: any,
  ref?: any,
  isDialog?: boolean,
  //按钮字段
  confirmText?: string,
  resetText?: string,
}

//React.FC函数组件类型
//props 的类型是 FormGeneratorProps
const SearchForm: React.FC<FormGeneratorProps> = forwardRef(({
  config,
  onFinish,
  onReset,
  //默认值
  values,
  isDialog = true,
  //按钮字段
  confirmText = '查询',
  resetText = '重置',

  //这里ref的放在这里是什么意思
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
    }
  }
  return (
    <>
      <Form
        className="layout_form"
        ref={ref}
        onFinish={onFinish}
        onReset={onReset}
      >
        {
          // 父组件作为props传入config
          config.map((item) => ( //直接return
            <Form.Item key={item.name} label={item.label} name={item.name}>
              {renderFormItem(item)}
            </Form.Item>
          ))
        }
        {/* 添加查询按钮 */}
        {isDialog && (
          <Form.Item>
            <Space>
              {/* 查询 提交之后自动调用onFinish*/}
              <Button type="primary" htmlType="submit">{confirmText}</Button>
              {/* 重置 重置表单字段之后自动调用onReset*/}
              <Button htmlType="reset">{resetText}</Button>
            </Space>
          </Form.Item>
        )}

      </Form>
    </>
  )
})

export default SearchForm