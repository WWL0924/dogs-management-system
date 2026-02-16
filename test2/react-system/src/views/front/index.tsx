//首页
import { Button, Carousel, Card } from 'antd';
import { useNavigate } from 'react-router-dom'
// 引入图片
import front1 from '@/assets/front1.webp'
import front2 from '@/assets/front2.jpg'
import front3 from '@/assets/front3.webp'
import { connect } from 'react-redux';
import { setToken } from '@/redux/module/global/action';



// 轮播图样式
const contentStyle: React.CSSProperties = {
  height: '400px',
  color: '#fff',
  lineHeight: '260px',
  textAlign: 'center',
  borderRadius: '8px',
  margin: '0',
};

//公告
const FrontAnnouncement = (props: any) => {
  const { setToken, token } = props
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

  //轮播图渲染
  const carouselItems = [
    {
      image: front1,
      title: '欢迎来到幸福社区',
    },
    {
      image: front2,
      title: '注册犬只数量：1250',
    },
    {
      image: front3,
      title: '文明遛狗，共建和谐社区',
    },
  ]
  //轮播图样式
  const pStyle: React.CSSProperties = {
    backgroundSize: '100% 100%',
    // width: '800px',
    // aspectRatio: '3 / 2',
    height: '400px',
    textAlign: 'center',
    lineHeight: '300px',
    fontSize: '24px',
  }
  return (
    <div style={{
      backgroundColor: '#f6ffed',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ width: '100%', maxWidth: '800px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} >
        <Carousel autoplay arrows={true} style={contentStyle}>
          {carouselItems.map((item, index) => (
            <div key={index}>
              <p style={{
                backgroundImage: `linear-gradient( rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.2) 80%),url(${item.image})`,
                ...pStyle,
              }}>{item.title}</p>
            </div>
          ))}
        </Carousel>
        <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
          <Button
            type="primary"
            size="large"
            onClick={handelClick}
            style={{ width: '200px', height: '45px', fontSize: '18px' }}
          >
            {token ? '退出登录' : '登录账号'}
          </Button>
        </div>
      </div >
    </div >
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