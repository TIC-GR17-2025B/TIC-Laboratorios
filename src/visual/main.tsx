import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider } from './common/contexts/EscenarioContext.tsx'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import Redes from './features/simulacion-redes/pages/Redes.tsx'

createRoot(document.getElementById('root')!).render(
  <EscenarioProvider>
    <ChatProvider>
      <ECSSceneProvider>
        <BrowserRouter>
          <Header />
          <div className="content">
            <Routes>
              <Route path='/' element={<VistaOficina />} />
              <Route path='/dispositivos' element={<Dispositivos />} />
              <Route path='/redes' element={<Redes />} />
            </Routes>
            <TarjetaLogNuevo />
          </div>
        </BrowserRouter>
      </ECSSceneProvider>
    </ChatProvider>
  </EscenarioProvider>,
)
