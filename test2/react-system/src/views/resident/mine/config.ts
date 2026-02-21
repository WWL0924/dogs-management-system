//犬只信息
//直接把所有信息放进去 map的时候根据不同属性map
export const mineConfig = [
  //基础信息
  {
    label: '姓名',
    name: 'name',
    type: 'input',
    placeholder: '请输入姓名'
  },
  {
    label: '品种',
    name: 'breed',
    type: 'input',
    placeholder: '请输入品种'
  },
  {
    label: '性别',
    name: 'sex',
    type: 'select',
    options: [
      { label: '雌性', value: '雌性' },
      { label: '雄性', value: '雄性' },
      // {label: '开发',value: 'developera'},
    ],
  }
  ,
  {
    label: '年龄',
    name: 'age',
    type: 'input',
    placeholder: '请输入年龄'
  },

  //健康信息
  {
    label: '是否接种疫苗',
    name: 'vaccine',
    type: 'checkbox',
    options: [
      { label: '是', value: true },
      { label: '否', value: false }]
  },
  {
    label: '疫苗记录',
    name: 'record',
    type: 'datepicker', //日期选择器
    render: (value: boolean) => (value ? '是' : '否'),
  },
  //归属信息
  {
    label: '主人姓名',
    name: 'masterName',
    type: 'input',
    placeholder: '请输入主人姓名'
  },
  {
    label: '联系电话',
    name: 'phone',
    type: 'input',
    placeholder: '请输入联系电话'
  },
  //证件信息
  {
    label: '犬证编号',
    name: 'num',
    type: 'input',
    placeholder: '请输入犬证编号'
  },
]