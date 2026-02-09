//这里在写全局的表单配置信息

export const formConfig: FormConfigItem[] = [
  {
    label: '姓名',
    name: 'name',
    type: 'input',
    placeholder: '请输入姓名'
  },
  {
    label: '职位',
    name: 'position',
    type: 'select',
    options: [
      { label: '开发', value: 'developera' },
      { label: '设计', value: 'designer' },
      // {label: '开发',value: 'developera'},
    ],
  }
]