import { Alert, Card, Col, Empty, Progress, Row, Statistic, Tag, Typography } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/api'
import type { Complaint, Dog } from '@/types/domain'

const { Text, Title } = Typography

type DashboardMode = 'admin' | 'resident'

const dogStatuses = [
  { status: 0, label: '待审核', color: '#d99a3d' },
  { status: 1, label: '已通过', color: '#428866' },
  { status: 2, label: '已驳回', color: '#bd6b63' },
]

const complaintStatusLabels: Record<number, string> = {
  0: '待处理',
  1: '已处理',
  2: '已驳回',
}

const DashboardSummary = ({ mode }: { mode: DashboardMode }) => {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const [dogsResponse, complaintsResponse] = await Promise.all([
          apiFetch('/api/dogs', { signal: controller.signal }),
          apiFetch('/api/complaints', { signal: controller.signal }),
        ])
        if (!dogsResponse.ok || !complaintsResponse.ok) throw new Error('统计数据加载失败')

        const [dogData, complaintData] = await Promise.all([
          dogsResponse.json() as Promise<Dog[]>,
          complaintsResponse.json() as Promise<Complaint[]>,
        ])
        if (controller.signal.aborted) return
        setDogs(dogData)
        setComplaints(complaintData)
        setError(false)
      } catch {
        if (!controller.signal.aborted) setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  const pendingDogs = dogs.filter((dog) => dog.status === 0).length
  const pendingComplaints = complaints.filter((complaint) => complaint.status === 0).length
  const vaccinatedDogs = dogs.filter((dog) => dog.vaccine).length
  const metrics = mode === 'admin'
    ? [
        { title: '登记犬只', value: dogs.length, icon: <SafetyCertificateOutlined />, tone: 'green' },
        { title: '待审核犬只', value: pendingDogs, icon: <ClockCircleOutlined />, tone: 'amber' },
        { title: '待处理投诉', value: pendingComplaints, icon: <FileTextOutlined />, tone: 'coral' },
        { title: '已接种犬只', value: vaccinatedDogs, icon: <CheckCircleOutlined />, tone: 'teal' },
      ]
    : [
        { title: '我的犬只', value: dogs.length, icon: <SafetyCertificateOutlined />, tone: 'green' },
        { title: '待审核登记', value: pendingDogs, icon: <ClockCircleOutlined />, tone: 'amber' },
        { title: '已接种犬只', value: vaccinatedDogs, icon: <CheckCircleOutlined />, tone: 'teal' },
        { title: '我的投诉', value: complaints.length, icon: <FileTextOutlined />, tone: 'coral' },
      ]

  return (
    <div className="dashboard-content">
      <div className="dashboard-section-heading">
        <div>
          <Text className="dashboard-eyebrow">社区概况</Text>
          <Title level={4}>一览当前信息</Title>
        </div>
        <Text type="secondary">数据来自当前账号可查看的记录</Text>
      </div>

      {error && <Alert type="warning" showIcon message="统计数据暂时无法加载，请稍后刷新页面" />}

      <Row gutter={[16, 16]} className="dashboard-metrics">
        {metrics.map((metric) => (
          <Col xs={12} md={12} xl={6} key={metric.title}>
            <Card className={`dashboard-metric dashboard-metric-${metric.tone}`} variant="borderless">
              <div className="dashboard-metric-icon">{metric.icon}</div>
              <Statistic title={metric.title} value={loading || error ? '—' : metric.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="dashboard-details">
        <section className="dashboard-status" aria-labelledby="dashboard-status-title">
          <div className="dashboard-panel-heading">
            <Title level={5} id="dashboard-status-title">犬只审核状态</Title>
            <Text type="secondary">共 {loading || error ? '—' : dogs.length} 条记录</Text>
          </div>
          {dogStatuses.map(({ status, label, color }) => {
            const count = dogs.filter((dog) => dog.status === status).length
            return (
              <div className="dashboard-status-row" key={status}>
                <div className="dashboard-status-label">
                  <Text>{label}</Text>
                  <Text strong>{loading || error ? '—' : count}</Text>
                </div>
                <Progress
                  percent={loading || error || !dogs.length ? 0 : Math.round(count / dogs.length * 100)}
                  strokeColor={color}
                  showInfo={false}
                  size="small"
                />
              </div>
            )
          })}
        </section>

        <section className="dashboard-recent" aria-labelledby="dashboard-dogs-title">
          <div className="dashboard-panel-heading">
            <Title level={5} id="dashboard-dogs-title">最近登记</Title>
            <Text type="secondary">最近 3 条</Text>
          </div>
          {!loading && !error && dogs.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无犬只记录" />}
          {dogs.slice(0, 3).map((dog) => (
            <div className="dashboard-recent-row" key={dog.id}>
              <div className="dashboard-recent-copy">
                <Text strong>{dog.name}</Text>
                <Text type="secondary">{dog.breed}{mode === 'admin' ? ` · ${dog.masterName}` : ''}</Text>
              </div>
              <Tag color={dog.status === 1 ? 'success' : dog.status === 2 ? 'error' : 'warning'}>
                {dogStatuses.find((item) => item.status === dog.status)?.label ?? '未知状态'}
              </Tag>
            </div>
          ))}
        </section>

        <section className="dashboard-recent" aria-labelledby="dashboard-complaints-title">
          <div className="dashboard-panel-heading">
            <Title level={5} id="dashboard-complaints-title">最近投诉</Title>
            <Text type="secondary">最近 3 条</Text>
          </div>
          {!loading && !error && complaints.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无投诉记录" />}
          {complaints.slice(0, 3).map((complaint) => (
            <div className="dashboard-recent-row" key={complaint.id}>
              <div className="dashboard-recent-copy">
                <Text strong ellipsis title={complaint.title || complaint.content}>
                  {complaint.title || complaint.content}
                </Text>
                <Text type="secondary">{complaint.name || '社区居民'}</Text>
              </div>
              <Tag color={complaint.status === 1 ? 'success' : complaint.status === 2 ? 'error' : 'warning'}>
                {complaintStatusLabels[complaint.status] ?? '未知状态'}
              </Tag>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default DashboardSummary
