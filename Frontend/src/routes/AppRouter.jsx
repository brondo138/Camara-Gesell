import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import AuthLayout from "../layouts/AuthLayout"
import PrivateRoute from "./PrivateRoute"

import Login        from "../pages/Login"
import Dashboard    from "../pages/Dashboard"
import Usuarios     from "../pages/Usuarios"
import Camaras      from "../pages/Camaras"
import Reservas     from "../pages/Reservas"
import Sesiones     from "../pages/Sesiones"
import DetalleSesion from "../pages/DetalleSesion"
import Grabaciones  from "../pages/Grabaciones"
import Reportes     from "../pages/Reportes"
import Perfil       from "../pages/Perfil"
import NotFound     from "../pages/NotFound"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/camaras"      element={<Camaras />} />
            <Route path="/reservas"     element={<Reservas />} />
            <Route path="/sesiones"     element={<Sesiones />} />
            <Route path="/sesiones/:id" element={<DetalleSesion />} />
            <Route path="/perfil"       element={<Perfil />} />

            {/* Solo admin */}
            <Route element={<PrivateRoute roles={["admin"]} />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>

            {/* Admin + docente */}
            <Route element={<PrivateRoute roles={["admin","docente"]} />}>
              <Route path="/grabaciones" element={<Grabaciones />} />
              <Route path="/reportes"    element={<Reportes />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
