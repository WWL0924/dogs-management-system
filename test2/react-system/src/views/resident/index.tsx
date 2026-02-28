import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SmileOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';
import '../../styles/dashboard.less';

const { Title, Paragraph } = Typography;

const ResidentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-welcome">
      <div className="welcome-card">
        {/* 插画占位符 */}
        <div style={{ marginBottom: 32 }}>
          <SmileOutlined className="welcome-icon" />
        </div>

        <Title level={2} className="welcome-title">
          欢迎来到幸福社区犬只管理系统 🐾
        </Title>

        <Paragraph className="welcome-desc">
          这是一个为您提供便捷犬只登记、信息查询及社区互动的平台。
          <br />
          请点击左侧菜单栏，开始您的体验吧！
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<RightOutlined />}
            onClick={() => navigate('/resident/mine')}
            className="action-btn"
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
            className="action-btn"
            danger
            style={{ boxShadow: 'none' }}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
