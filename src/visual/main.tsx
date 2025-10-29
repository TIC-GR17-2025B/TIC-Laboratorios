import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider } from './common/contexts/EscenarioContext.tsx'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'


createRoot(document.getElementById('root')!).render(
  <EscenarioProvider>
    <ECSSceneProvider>
      <BrowserRouter>
        <Header />
        <div className="content">
          <Routes>
            <Route path='/' element={<VistaOficina />} />
            <Route path='/dispositivos' element={<Dispositivos />} />
          </Routes>
          <TarjetaLogNuevo />
        </div>
      </BrowserRouter>
    </ECSSceneProvider>
  </EscenarioProvider>
  ,
)
