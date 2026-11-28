import logo from '@/assets/logo.jpg'
import stylue from './index.module.less'


const Logo = () => {
  return (
    <div className={stylue.logo}>
      <img src={logo} alt="幸福社区标识" className={stylue.logo_img} />
    </div >
  )
}

export default Logo
