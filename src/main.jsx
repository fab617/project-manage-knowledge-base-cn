import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './DataContext.jsx'
import Process from './views/process/index.jsx'
import Performance from './views/performance/index.jsx'
import Tools from './views/tools/index.jsx'
import InputsOutputs from './views/inputs/index.jsx'
import Home from './views/home/index.jsx'
import { Spin } from 'antd'

function LoadingWrapper({ children }) {
  const { loading } = useData()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }
  
  return children
}

function AppRoutes() {
  return (
    <DataProvider>
      <LoadingWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<Process />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/inputs" element={<InputsOutputs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoadingWrapper>
    </DataProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
