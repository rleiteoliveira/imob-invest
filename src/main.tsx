import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Importante: O CSS novo do Tailwind v4
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)