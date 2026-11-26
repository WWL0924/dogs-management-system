import { Result } from "antd"


const NoPermission = () => {

  return (
    <>
      <Result
        status="403"
        title='403'
        //副标题
        subTitle="对不起 您没有权限"
      />
    </>
  )
}

export default NoPermission  