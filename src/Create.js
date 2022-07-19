import { useState } from 'react'
import { useContract } from '@vechain.energy/use-vechain'
import { Form, Input, Button, Spin, Alert } from 'antd'

const { address, abi } = require('./contract.json')
const { TextArea } = Input

export default function FormCreate () {
  const contract = useContract(address, abi)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  const handleCreate = async ({ title, description }) => {
    setLoading(true)
    setError()
    try {
      await contract.createIdea(title, description)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Spin spinning={loading} tip='Publishing…'>
      <Form layout='vertical' onFinish={handleCreate}>
        <Form.Item label='Title' name='title' required>
          <Input />
        </Form.Item>
        <Form.Item label='Description' name='description' required>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button block type='primary' htmlType='submit'>Add Idea</Button>
        </Form.Item>
        {!!error && <Alert message='publication failed' description={error} type='error' closable />}
      </Form>
    </Spin>
  )
}
