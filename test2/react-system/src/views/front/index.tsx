//首页
import { Button, Carousel } from 'antd';


//公告
const FrontAnnouncement = () => {
  return (
    <div>
      <Carousel autoplay>
        {/* 注册犬只数量 */}
        <div>
          <h3>1</h3>
        </div>
        <div>
          <h3>2</h3>
        </div>
        <div>
          <h3>3</h3>
        </div>
        <div>
          <h3>4</h3>
        </div>
      </Carousel>
      <Button>进入系统</Button>

    </div>
  )
}

export default FrontAnnouncement