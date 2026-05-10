import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { QueryProvider } from './providers/QueryProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#881337',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: '"DM Sans", sans-serif',
                  padding: '12px 16px',
                  boxShadow: '0 8px 32px rgba(136,19,55,0.35)',
                },
                success: { iconTheme: { primary: '#86efac', secondary: '#881337' } },
                error: { iconTheme: { primary: '#fecaca', secondary: '#881337' } },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
