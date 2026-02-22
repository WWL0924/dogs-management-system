import { Collapse } from 'antd';
const Rules = () => {
  return (
    <div>
      <Collapse defaultActiveKey={['1']}>
        <Collapse.Panel header="社区规范" key="1">
          <p>1. <strong>牵绳遛狗：</strong> 出门必须系牵引绳，大型犬需佩戴嘴套。</p>
          <p>2. <strong>清理粪便：</strong> 随身携带清理工具，及时清理犬只排泄物。</p>
          <p>3. <strong>定期免疫：</strong> 每年定期为爱犬注射狂犬疫苗。</p>
          <p>4. <strong>禁止扰民：</strong> 控制犬只吠叫，避免夜间或清晨扰民。</p>
          <p>5. <strong>禁入区域：</strong> 禁止带犬进入儿童游乐区、健身区等公共场所。</p>
        </Collapse.Panel>
        <Collapse.Panel header="处罚标准" key="2">
          <p>1. <strong>未系牵引绳：</strong> 首次警告，二次罚款 50 元。</p>
          <p>2. <strong>未清理排泄物：</strong> 责令清理并罚款 50 元。</p>
          <p>3. <strong>犬只伤人：</strong> 需承担医疗费用及相应法律责任，并可能强制收容犬只。</p>
          <p>4. <strong>未登记犬只：</strong> 请尽快在系统完成信息登记，逾期将按无证处理。</p>
        </Collapse.Panel>
        <Collapse.Panel header="常见问题" key="3">
          <p><strong>Q：如何进行犬只登记？</strong></p>
          <p>A：请在“我的犬只”页面点击“新增”，填写信息并提交审核即可。</p>
          <p><strong>Q：发现有人不文明遛狗怎么办？</strong></p>
          <p>A：请在“投诉举报”页面提交证据，我们会尽快处理。</p>
          <p><strong>Q：每年什么时候打疫苗？</strong></p>
          <p>A：通常在春季，社区会组织统一接种，请留意公告。</p>
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
export default Rules
