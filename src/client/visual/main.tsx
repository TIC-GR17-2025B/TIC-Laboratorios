import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes, useLocation, Outlet } from 'react-router'
import Sidebar from './common/components/Sidebar.tsx'
import { EscenarioProvider, ModalProvider, SelectedLevelProvider, ScreenTransitionProvider } from './common/contexts'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import { AgentMalvadoProvider } from './features/agent-malvado/presentation/context/AgentMalvadoContext.tsx'
import Redes from './features/simulacion-redes/pages/Redes.tsx'
import Modal from './common/components/Modal.tsx'
import ModelPreloader from './common/components/ModelPreloader.tsx'
import AuthPage from './features/admin-docente-y-estudiante/pages/AuthPage.tsx'
import NotFound from './features/admin-docente-y-estudiante/pages/NotFound.tsx'
import ProtectedRoute from './features/admin-docente-y-estudiante/components/ProtectedRoute.tsx'
import ProtectedRouteByRole from './features/admin-docente-y-estudiante/components/ProtectedRouteByRole.tsx'
import VistaDocente from './features/admin-docente-y-estudiante/pages/VistaDocente.tsx'
import DetalleGrupo from './features/admin-docente-y-estudiante/pages/DetalleGrupo.tsx'
import VistaDetalleEstudiante from './features/admin-docente-y-estudiante/pages/VistaDetalleEstudiante.tsx'
import DocenteLayout from './features/admin-docente-y-estudiante/components/DocenteLayout.tsx'
import EstudianteLayout from './features/admin-docente-y-estudiante/components/EstudianteLayout.tsx'
import VistaPerfil from './features/admin-docente-y-estudiante/pages/VistaPerfil.tsx'
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
                <ScreenTransitionProvider>
                  <ModelPreloader />
                  <Modal />
                  <Sidebar />
                  <div className="content">
                    <Outlet />
                    <TarjetaLogNuevo />
                  </div>
                </ScreenTransitionProvider>
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
    <>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path='/login' element={<AuthPage />} />
          <Route path='/signup' element={<AuthPage />} />

          <Route path='/docente' element={
            <ProtectedRouteByRole requiredRole="profesor">
              <DocenteLayout />
            </ProtectedRouteByRole>
          }>
            <Route index element={<VistaDocente />} />
            <Route path='grupo/:id' element={<DetalleGrupo />} />
            <Route path='estudiante/:idEstudiante' element={<VistaDetalleEstudiante />} />
          </Route>

          <Route element={
            <ProtectedRouteByRole requiredRole="estudiante">
              <EstudianteLayout />
            </ProtectedRouteByRole>
          }>
            <Route path='/seleccion-niveles' element={<VistaSeleccionNiveles />} />
            <Route path='/perfil' element={<VistaPerfil />} />
          </Route>

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
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AgentMalvadoProvider>
      <SelectedLevelProvider>
        <AnimatedRoutes />
      </SelectedLevelProvider>
    </AgentMalvadoProvider>
  </BrowserRouter>,
)
