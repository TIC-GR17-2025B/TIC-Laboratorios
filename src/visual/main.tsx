import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider, ModalProvider } from './common/contexts'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import Redes from './features/simulacion-redes/pages/Redes.tsx'
import Modal from './common/components/Modal.tsx'
import { FirewallLogsProviderWrapper } from './features/simulacion-redes/context/FirewallLogsProviderWrapper.tsx'

createRoot(document.getElementById('root')!).render(
  <EscenarioProvider>
    <ModalProvider>
      <ChatProvider>
        <ECSSceneProvider>
          <FirewallLogsProviderWrapper>
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
              <Modal />
            </BrowserRouter>
          </FirewallLogsProviderWrapper>
        </ECSSceneProvider>
      </ChatProvider>
    </ModalProvider>
  </EscenarioProvider>,
)
