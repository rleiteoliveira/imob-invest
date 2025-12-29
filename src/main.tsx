import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrandProvider } from './context/BrandContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandProvider>
      <App />
    </BrandProvider>
  </StrictMode>
)