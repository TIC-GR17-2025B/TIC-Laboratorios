import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider } from './common/contexts/EscenarioContext.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import FloatingChat from './features/chat/components/FloatingChat/FloatingChat.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
    <EscenarioProvider>
      <BrowserRouter>
        <Header />
        <div className="content">
          <Routes>
            <Route path='/' element={<VistaOficina />} />
            <Route path='/dispositivos' element={<Dispositivos />} />
          </Routes>
        </div>
        <FloatingChat />
      </BrowserRouter>
    </EscenarioProvider>
    </ChatProvider>
  </StrictMode>,
)
