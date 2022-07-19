import { useState } from 'react'
import { useContract, useAccount, useCall } from '@vechain.energy/use-vechain'
import { Button, Alert } from 'antd'

const { address, abi } = require('./contract.json')

export default function ChangeStatus ({ tokenId, status }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const contract = useContract(address, abi)
  const { account } = useAccount()
  const owner = useCall(address, abi.find(({ name }) => name === 'owner'))

  const handleStatus = (newStatus) => async () => {
    setLoading(true)
    setError()
    try {
      await contract.setStatus(tokenId, newStatus, { comment: `Change status to ${newStatus}` })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (account !== owner) {
    return <></>
  }

  return (
    <>
      {!!error && <Alert message='status change failed' description={error} type='error' closable />}
      <Button type={status === 0 ? 'primary' : 'secondary'} onClick={handleStatus(0)} loading={loading}>0</Button>
      <Button type={status === 1 ? 'primary' : 'secondary'} onClick={handleStatus(1)} loading={loading}>1</Button>
      <Button type={status === 2 ? 'primary' : 'secondary'} onClick={handleStatus(2)} loading={loading}>2</Button>
      <Button type={status === 3 ? 'primary' : 'secondary'} onClick={handleStatus(3)} loading={loading}>3</Button>
    </>
  )
}
