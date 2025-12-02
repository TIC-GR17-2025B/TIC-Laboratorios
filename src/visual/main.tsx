import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes, useLocation, Outlet } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider, ModalProvider, SelectedLevelProvider } from './common/contexts'
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
import VistaSeleccionNiveles from './features/escenarios-simulados/pages/VistaSeleccionNiveles.tsx'

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

// Wrapper con todos los providers del juego
function GameProvidersLayout() {
  return (
    <ProtectedRoute>
      <EscenarioProvider>
        <ModalProvider>
          <ChatProvider>
            <FasesProvider>
              <ECSSceneProvider>
                <ModelPreloader />
                <Modal />
                <Header />
                <div className="content">
                  <Outlet />
                  <TarjetaLogNuevo />
                </div>
              </ECSSceneProvider>
            </FasesProvider>
          </ChatProvider>
        </ModalProvider>
      </EscenarioProvider>
    </ProtectedRoute>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route path='/seleccion-niveles' element={
          <ProtectedRoute>
            <VistaSeleccionNiveles />
          </ProtectedRoute>
        } />

        {/* 
          Las rutas del juego comparten los mismos providers con Outlet
          También les paso el Header, Modal y TarjetaLogNuevo 
        */}
        <Route element={<GameProvidersLayout />}>
          <Route path='/' element={<VistaOficina />} />
          <Route path='/dispositivos' element={<Dispositivos />} />
          <Route path='/redes' element={<Redes />} />
          <Route path='/fases-partida' element={<VistaFasesPartida />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SelectedLevelProvider>
      <AnimatedRoutes />
    </SelectedLevelProvider>
  </BrowserRouter>,
)