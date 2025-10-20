import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'

import { escenario } from './mocks/EscenarioMock.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header title={escenario.titulo} />
      <div className="content">
        <Routes>
          <Route path='/' element={<VistaOficina />} />
          <Route path='/dispositivos' element={<Dispositivos />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
