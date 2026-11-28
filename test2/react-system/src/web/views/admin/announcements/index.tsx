import { Alert, Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { apiFetch, apiJson } from '@/api'
import type { Announcement } from '@/types/domain'

type AnnouncementValues = { title: string; content: string; publish: boolean }

export default function ManageAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<AnnouncementValues>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await apiJson<Announcement[]>('/api/announcements/manage'))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '公告加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openEditor = (item: Announcement | null) => {
    setEditing(item)
    form.setFieldsValue({ title: item?.title || '', content: item?.content || '', publish: Boolean(item?.publishedAt) })
    setOpen(true)
  }

  const save = async () => {
    let values: AnnouncementValues
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    setSaving(true)
    try {
      await apiJson<Announcement>(editing ? `/api/announcements/${editing.id}` : '/api/announcements', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setOpen(false)
      message.success(editing ? '公告已更新' : '公告已创建')
      await load()
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    try {
      const response = await apiFetch(`/api/announcements/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '删除失败')
      }
      message.success('公告已删除')
      await load()
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : '删除失败')
    }
  }

  return (
    <div className="page-container">
      <div className="table-operations" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>公告管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)}>新增公告</Button>
      </div>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 700 }}
        columns={[
          { title: '标题', dataIndex: 'title', ellipsis: true },
          { title: '状态', dataIndex: 'publishedAt', width: 110, render: (value: string | null) => <Tag color={value ? 'success' : 'default'}>{value ? '已发布' : '草稿'}</Tag> },
          { title: '发布时间', dataIndex: 'publishedAt', width: 160, render: (value: string | null) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—' },
          { title: '作者', dataIndex: 'authorName', width: 120 },
          { title: '操作', width: 160, render: (_: unknown, item: Announcement) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} aria-label={`编辑${item.title}`} title="编辑" onClick={() => openEditor(item)} />
              <Popconfirm title="删除这条公告？" onConfirm={() => void remove(item.id)} okText="删除" cancelText="取消">
                <Button type="text" danger icon={<DeleteOutlined />} aria-label={`删除${item.title}`} title="删除" />
              </Popconfirm>
            </Space>
          ) },
        ]}
      />
      <Modal title={editing ? '编辑公告' : '新增公告'} open={open} confirmLoading={saving} okText="保存" cancelText="取消" onOk={() => void save()} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, whitespace: true, max: 100, message: '请输入不超过100字的标题' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="内容" name="content" rules={[{ required: true, whitespace: true, message: '请输入公告内容' }]}>
            <Input.TextArea rows={6} maxLength={10000} showCount />
          </Form.Item>
          <Form.Item label="发布" name="publish" valuePropName="checked">
            <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
