import logo from '@/assets/react.svg'
import stylue from './index.module.less'


const Logo = () => {
  return (
    <div className={stylue.logo}>
      <img src={logo} alt="" className={stylue.logo_img} />
    </div >
  )
}

export default Logo