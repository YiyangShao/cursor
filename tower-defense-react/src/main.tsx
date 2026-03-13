import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadAssets } from './game/assets'
import './index.css'
import App from './App.tsx'

loadAssets().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
