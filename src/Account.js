import { useAccount } from '@vechain.energy/use-vechain'
import { Typography, Button, Alert } from 'antd'

export default function Account () {
  const { account, error, isLoading, connect, disconnect } = useAccount()

  const Address = () => <Typography.Text type='secondary'>{account.slice(0, 4)}…{account.slice(-4)}</Typography.Text>
  const handleConnect = () => connect('identify yourself to access the app')

  return (
    <div>
      {account && <Button block onClick={disconnect} danger shape='round' icon={<Address />}>&nbsp;sign out</Button>}
      {!account && <Button block onClick={handleConnect} loading={isLoading} shape='round'>sign in</Button>}
      {!!error && <Alert message='identification failed' description={error} type='error' closable />}
    </div>
  )
}
