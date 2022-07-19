import { useState } from 'react'
import { useContract } from '@vechain.energy/use-vechain'
import { Button, Alert, Card } from 'antd'
import ChangeStatus from './ChangeStatus'

const { address, abi } = require('./contract.json')

export default function Idea ({ tokenId, title, description, upvotes, status }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const contract = useContract(address, abi)

  const handleUpvote = async () => {
    setLoading(true)
    setError()
    try {
      await contract.upvote(tokenId, { comment: `Upvote ${title}` })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={title}
      actions={[
        <Button key='upvote' type='link' block onClick={handleUpvote} loading={loading}>{upvotes} votes</Button>
      ]}
      size='small'
      bordered
      hoverable
      style={{ marginBottom: 24 }}
    >
      {!!error && <Alert message='upvote failed' description={error} type='error' closable />}
      <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
      <ChangeStatus tokenId={tokenId} status={Number(status)} />
    </Card>
  )
}
