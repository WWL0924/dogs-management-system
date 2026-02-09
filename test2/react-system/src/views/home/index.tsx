import ButtonPer from "@/components/ButtonPer";
import { Button } from "antd";


function Home() {
  return (
    <>
      <h1>home</h1>
      {/* 应用组件 */}
      <ButtonPer
        btn={'add'}
        Comp={
          <Button type="primary">添加</Button>
        }
      >
      </ButtonPer>
{/* 这里不会被渲染  */}
      <ButtonPer
        btn={'del'}
        Comp={
          <Button type="primary">删除</Button>
        }
      >
      </ButtonPer>
    </>
  )
}

export default Home