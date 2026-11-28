import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setToken, setUserInfo } from '@/redux/module/global/action'

export function useLogout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (destination: '/front' | '/login' = '/front') => {
    dispatch(setToken(''))
    dispatch(setUserInfo({ role: 'resident', account: '', name: '' }))
    navigate(destination, { replace: true })
  }
}
