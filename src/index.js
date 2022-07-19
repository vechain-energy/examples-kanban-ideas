import React from 'react'
import ReactDOM from 'react-dom/client'
import 'antd/dist/antd.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { VeChainProvider } from '@vechain.energy/use-vechain'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <VeChainProvider
      config={{ node: 'https://testnet.veblocks.net', network: 'test' }}
      options={{ delegate: 'https://sponsor-testnet.vechain.energy/by/90', delegateTest: 'https://sponsor-testnet.vechain.energy/by/90/test' }}
    >
      <App />
    </VeChainProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
