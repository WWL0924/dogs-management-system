//首页
import { Button, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom'
// 引入图片
import front1 from '@/assets/front1.webp'
import front2 from '@/assets/front2.jpg'
import front3 from '@/assets/front3.webp'
import { connect } from 'react-redux';
import { setToken } from '@/redux/module/global/action';
import './index.less';
import { useEffect, useState } from 'react';

//公告
const FrontAnnouncement = (props: any) => {
  const { setToken, token } = props
  //状态管理
  const [num, setNum] = useState(0)
  //导航功能
  const navigate = useNavigate()
  const handelClick = () => {
    //有token 退出登录 无token 登录账号
    if (token) {
      //这里还要删除token么
      setToken('')
      //退出登录
      navigate('/login')
    } else {
      //登录账号
      navigate('/login')
    }
  }
  //获取实际的注册犬只数量
  const fetchNum = async () => {
    const res = await fetch('http://localhost:4000/dogs')
    const result = await res.json()
    //统计数量
    const num = result.length
    console.log(num)
    //更新状态
    setNum(num)
  }

  useEffect(() => {
    fetchNum()
  }, [])

  //轮播图渲染
  const carouselItems = [
    {
      image: front1,
      title: '欢迎来到幸福社区',
    },
    {
      image: front2,
      title: `注册犬只数量：${num}`,
    },
    {
      image: front3,
      title: '文明遛狗，共建和谐社区',
    },
  ]

  return (
    <div className="front-container">
      <div className="front-content">
        <Carousel autoplay arrows={true} className="carousel-style">
          {carouselItems.map((item, index) => (
            <div key={index}>
              <div
                className="carousel-item"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4)), url(${item.image})`
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </Carousel>
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
    </div>
  )
}

// export default FrontAnnouncement
//取数据
const mapStateToProps = (state: any) => {
  return {
    token: state.global.token,
  }
}
const mapDispatchToProps = { setToken }

export default connect(mapStateToProps, mapDispatchToProps)(FrontAnnouncement)