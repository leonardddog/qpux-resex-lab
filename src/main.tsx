import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@npm-questionpro/wick-ui-lib/dist/style.css'
import '@npm-questionpro/wick-ui-icon/dist/wu-icon.css'
import './index.css'
import favicon from '../assets/questionpro.svg'
import App from './App.tsx'

const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (icon) icon.href = favicon

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
