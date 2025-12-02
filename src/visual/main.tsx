import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider, ModalProvider } from './common/contexts'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import Redes from './features/simulacion-redes/pages/Redes.tsx'
import Modal from './common/components/Modal.tsx'
import ModelPreloader from './common/components/ModelPreloader.tsx'
import Login from './features/admin-docente-y-estudiante/pages/Login.tsx'
import Signup from './features/admin-docente-y-estudiante/pages/Signup.tsx'
import NotFound from './features/admin-docente-y-estudiante/pages/NotFound.tsx'
import ProtectedRoute from './features/admin-docente-y-estudiante/components/ProtectedRoute.tsx'
import { AnimatePresence } from 'framer-motion'
import VistaFasesPartida from './features/escenarios-simulados/pages/VistaFasesPartida.tsx'
import { FasesProvider } from './features/escenarios-simulados/contexts/FasesContext.tsx'

const shouldRedirect = sessionStorage.getItem('redirect-on-reload');
if (shouldRedirect === 'true') {
  sessionStorage.removeItem('redirect-on-reload');
  window.history.replaceState(null, '', '/');
}

window.addEventListener('beforeunload', () => {
  const currentPath = window.location.pathname;
  if (currentPath === '/dispositivos' || currentPath === '/redes') {
    sessionStorage.setItem('redirect-on-reload', 'true');
  }
});

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route path='/' element={
          <ProtectedRoute>
            <EscenarioProvider>
              <ModalProvider>
                <ChatProvider>
                  <FasesProvider>
                    <ECSSceneProvider>
                      <ModelPreloader />
                      <Header />
                      <div className="content">
                        <VistaOficina />
                        <TarjetaLogNuevo />
                      </div>
                      <Modal />
                    </ECSSceneProvider>
                  </FasesProvider>
                </ChatProvider>
              </ModalProvider>
            </EscenarioProvider>
          </ProtectedRoute>
        } />

        <Route path='/dispositivos' element={
          <ProtectedRoute>
            <EscenarioProvider>
              <ModalProvider>
                <ChatProvider>
                  <FasesProvider>
                  <ECSSceneProvider>
                    <ModelPreloader />
                    <Header />
                    <div className="content">
                      <Dispositivos />
                      <TarjetaLogNuevo />
                    </div>
                    <Modal />
                  </ECSSceneProvider>
                  </FasesProvider>
                </ChatProvider>
              </ModalProvider>
            </EscenarioProvider>
          </ProtectedRoute>
        } />

        <Route path='/redes' element={
          <ProtectedRoute>
            <EscenarioProvider>
              <ModalProvider>
                <ChatProvider>
                  <FasesProvider>
                  <ECSSceneProvider>
                    <ModelPreloader />
                    <Header />
                    <div className="content">
                      <Redes />
                      <TarjetaLogNuevo />
                    </div>
                    <Modal />
                  </ECSSceneProvider>
                  </FasesProvider>
                </ChatProvider>
              </ModalProvider>
            </EscenarioProvider>
          </ProtectedRoute>
        } />
        
        <Route path='/fases-partida' element={
          <ProtectedRoute>
            <EscenarioProvider>
              <ModalProvider>
                <ChatProvider>
                  <FasesProvider>
                  <ECSSceneProvider>
                    <ModelPreloader />
                    <Header />
                    <div className="content">
                      <VistaFasesPartida />
                      <TarjetaLogNuevo />
                    </div>
                    <Modal />
                  </ECSSceneProvider>
                  </FasesProvider>
                </ChatProvider>
              </ModalProvider>
            </EscenarioProvider>
          </ProtectedRoute>
        } />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>,
)
