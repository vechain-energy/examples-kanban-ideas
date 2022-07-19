import { Row, Col } from 'antd'
import Account from './Account'
import Create from './Create'
import List from './List'
import Info from './Info'

function App () {
  return (
    <Row gutter={[16, 16]}>
      <Col span={22} offset={1}><Info /></Col>
      <Col span={22} offset={1}><List /></Col>
      <Col span={22} offset={1}><Create /></Col>
      <Col span={22} offset={1}><Account /></Col>
    </Row>
  )
}

export default App
