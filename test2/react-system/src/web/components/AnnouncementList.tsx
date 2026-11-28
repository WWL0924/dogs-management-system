import { Alert, Empty, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { apiJson } from '@/api'
import type { Announcement } from '@/types/domain'
import './announcements.less'

const { Paragraph, Text, Title } = Typography

export default function AnnouncementList({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiJson<Announcement[]>('/api/announcements')
      .then((data) => { if (active) setItems(data) })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '公告加载失败') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <section className={`announcements ${compact ? 'announcements-compact' : ''}`} aria-labelledby="announcements-title">
      <div className="announcements-heading">
        <Title level={compact ? 4 : 3} id="announcements-title">社区公告</Title>
        <Text type="secondary">最新通知</Text>
      </div>
      {loading && <div className="announcements-loading"><Spin /></div>}
      {error && <Alert type="warning" showIcon message={error} />}
      {!loading && !error && items.length === 0 && <Empty description="暂无公告" />}
      {!loading && !error && items.slice(0, compact ? 3 : undefined).map((item) => (
        <article className="announcement-item" key={item.id}>
          <div className="announcement-item-heading">
            <Title level={5}>{item.title}</Title>
            <Text type="secondary">{dayjs(item.publishedAt).format('YYYY-MM-DD')}</Text>
          </div>
          <Paragraph>{item.content}</Paragraph>
          <Text type="secondary">{item.authorName}</Text>
        </article>
      ))}
    </section>
  )
}
