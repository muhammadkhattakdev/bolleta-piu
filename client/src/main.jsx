import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/context.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>

  <BrowserRouter>
    <App />
  </BrowserRouter>
  </AuthProvider>

)
