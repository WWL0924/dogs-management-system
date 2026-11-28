//首页
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom'
// 引入图片
import logo from '@/assets/logo.jpg'
import { connect } from 'react-redux';
import { setToken } from '@/redux/module/global/action';
import './index.less';
import { useEffect, useState } from 'react';
import type { RootState } from '@/redux/interface';
import { apiFetch } from '@/api';
import { useLogout } from '@/hooks/useLogout';
import AnnouncementList from '@/components/AnnouncementList';

//公告
const FrontAnnouncement = (props: { setToken: typeof setToken; token: string }) => {
  const { token } = props
  //状态管理
  const [num, setNum] = useState(0)
  //导航功能
  const navigate = useNavigate()
  const logout = useLogout()
  const handelClick = () => {
    //有token 退出登录 无token 登录账号
    if (token) {
      //这里还要删除token么
      logout('/login')
      //退出登录
    } else {
      //登录账号
      navigate('/login')
    }
  }
  //获取实际的注册犬只数量
  const fetchNum = async () => {
    const res = await apiFetch('/api/dogs/count')
    const result = await res.json()
    //统计数量
    const num = result.count
    console.log(num)
    //更新状态
    setNum(num)
  }

  useEffect(() => {
    void Promise.resolve().then(fetchNum)
  }, [])

  //轮播图渲染
  return (
    <div className="front-container">
      <header className="front-header">
        <div className="front-inner front-header-inner">
          <div className="front-brand">
            <img src={logo} alt="幸福社区标识" />
            <div className="front-brand-text">
              <strong>幸福社区</strong>
              <span>文明养犬服务</span>
            </div>
          </div>
          <div className="action-area">
            <Button
              type="primary"
              size="large"
              onClick={handelClick}
              className="action-btn"
            >
              {token ? '退出登录' : '登录账号'}
            </Button>
          </div>
        </div>
      </header>
      <main>
        <section className="front-overview" aria-labelledby="front-title">
          <div className="front-inner front-overview-inner">
            <div className="front-intro">
              <span className="front-overline">社区养犬服务</span>
              <h1 id="front-title">欢迎来到幸福社区</h1>
              <p>文明遛狗，共建和谐社区</p>
            </div>
            <div className="front-stat">
              <span className="front-stat-label">注册犬只数量</span>
              <div className="front-stat-value"><strong>{num}</strong><span>只</span></div>
            </div>
          </div>
        </section>
        <div className="front-announcements front-inner">
          <AnnouncementList compact />
        </div>
      </main>
    </div>
  )
}

// export default FrontAnnouncement
//取数据
const mapStateToProps = (state: RootState) => {
  return {
    token: state.global.token,
  }
}
const mapDispatchToProps = { setToken }

export default connect(mapStateToProps, mapDispatchToProps)(FrontAnnouncement)
