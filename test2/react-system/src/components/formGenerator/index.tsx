import { Button, Form, Input, Select, Space } from "antd"

interface FormGeneratorProps {
  config: FormConfigItem[],
  onFinish?: (values: any) => void,
  onReset?: () => void,
  values?: any,
  //按钮字段
  confirmText?: string,
  resetText?: string,
}

//React.FC函数组件类型
//props 的类型是 FormGeneratorProps
const SearchForm: React.FC<FormGeneratorProps> = ({
  config,
  onFinish,
  onReset,
  //默认值
  values,
  //按钮字段
  confirmText = '查询',
  resetText = '重置',
}) => {
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
        <Form.Item>
          <Space>

            <Button type="primary">{confirmText}</Button>
            <Button >{resetText}</Button>

          </Space>

        </Form.Item>
      </Form>
    </>
  )
}

export default SearchForm