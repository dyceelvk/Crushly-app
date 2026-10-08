import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Flips the boot check in index.html: the bundle executed.
;(window as unknown as { __CRUSHLY_BOOTED__: boolean }).__CRUSHLY_BOOTED__ = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
