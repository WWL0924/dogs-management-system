import { Typography, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SmileOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';

const { Title, Paragraph } = Typography;

const ResidentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // 柔和的渐变背景
      padding: '24px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 800,
          textAlign: 'center',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          padding: '40px 20px'
        }}
        bordered={false}
      >
        {/* 插画占位符 - 这里可以用实际的图片替换 */}
        <div style={{ marginBottom: 32 }}>
          <SmileOutlined style={{ fontSize: 80, color: '#1890ff' }} />
        </div>

        <Title level={2} style={{ marginBottom: 16 }}>
          欢迎来到幸福社区犬只管理系统 🐾
        </Title>

        <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
          这是一个为您提供便捷犬只登记、信息查询及社区互动的平台。
          <br />
          请点击左侧菜单栏，开始您的体验吧！
        </Paragraph>

        <Button
          type="primary"
          size="large"
          shape="round"
          icon={<RightOutlined />}
          onClick={() => navigate('/resident/mine')}
          style={{ padding: '0 32px', height: 48, fontSize: 16 }}
        >
          快速开始：我的犬只
        </Button>
        {/* 退出登录 */}
        <Button
          type="primary"
          size="large"
          shape="round"
          icon={<RightOutlined />}
          onClick={() => navigate('/front')}
          style={{ padding: '0 32px', height: 48, fontSize: 16 }}
        >
          退出登录
        </Button>
      </Card>
    </div>
  );
};

export default ResidentDashboard;
