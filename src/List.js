import { useState, useEffect, useCallback } from 'react'
import { useContract, useAccount } from '@vechain.energy/use-vechain'
import { Row, Col, Typography } from 'antd'
import Idea from './Idea'

const { address, abi } = require('./contract.json')
const { Title } = Typography

export default function List () {
  const contract = useContract(address, abi)
  const { transactionIds } = useAccount()
  const [ideasByStatus, setIdeasByStatus] = useState([])

  const updateIdeas = useCallback(async function () {
    if (!contract.totalSupply) { return }

    const totalSupply = await contract.totalSupply()
    const ideas = []

    // loop from 0 to totalSupply to read each token
    for (let index = 0; index < totalSupply; index++) {
      const tokenId = await contract.tokenByIndex(index)
      const attributes = await contract.tokenAttributes(tokenId)
      ideas.push({ tokenId, ...attributes })
    }

    // sort ideas and group by status
    setIdeasByStatus(ideas
      .sort((idea1, idea2) => idea2.upvotes - idea1.upvotes)
      .reduce((byStatus, idea) => {
        const status = Number(idea.status)
        if (!byStatus[status]) {
          byStatus[status] = []
        }

        byStatus[status].push(idea)
        return byStatus
      }, []))
  }, [contract])

  useEffect(() => {
    updateIdeas()
  }, [updateIdeas, transactionIds])

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Title level={3} align='center'>New Ideas</Title>
        {ideasByStatus[0]?.map(idea => <Idea key={idea.tokenId} {...idea} />)}
      </Col>

      <Col span={6}>
        <Title level={3} align='center'>in Progress</Title>
        {ideasByStatus[1]?.map(idea => <Idea key={idea.tokenId} {...idea} />)}
      </Col>

      <Col span={6}>
        <Title level={3} align='center'>Completed</Title>
        {ideasByStatus[2]?.map(idea => <Idea key={idea.tokenId} {...idea} />)}
      </Col>

      <Col span={6}>
        <Title level={3} align='center'>Cancelled</Title>
        {ideasByStatus[3]?.map(idea => <Idea key={idea.tokenId} {...idea} />)}
      </Col>
    </Row>
  )
}
