import { Result } from "antd"


const NoFound = () => {

  return (
    <>
      <Result
        status="404"
        title='404'
        //副标题
        subTitle="对不起 你没有找到"
      />
    </>
  )
}

export default NoFound