import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CrushlyProvider } from './lib/store'
import './index.css'

// Signals the boot check in index.html that the bundle executed.
;(window as unknown as { __CRUSHLY_BOOTED__: boolean }).__CRUSHLY_BOOTED__ = true

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CrushlyProvider>
      <App />
    </CrushlyProvider>
  </React.StrictMode>,
)
