import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './DataContext.jsx'
import Process from './views/process/index.jsx'
import Performance from './views/performance/index.jsx'
import Tool from './views/tool/index.jsx'
import InputsOutput from './views/io/index.jsx'
import Home from './views/home/index.jsx'
import { Spin } from 'antd'
import { useScrollToTop } from './hooks/useScrollToTop'

function ScrollToTop() {
  useScrollToTop()
  return null
}

const basePath = import.meta.env.VITE_BASE_PATH 
  ? `/${import.meta.env.VITE_BASE_PATH}/` 
  : '/files/pm/';

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <ScrollToTop />
      <DataProvider>
        <LoadingWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/process" element={<Process />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/tool" element={<Tool />} />
            <Route path="/io" element={<InputsOutput />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LoadingWrapper>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
)
