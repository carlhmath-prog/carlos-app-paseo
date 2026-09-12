// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { PaseaFeliz } from "./pages/paseafeliz/PaseaFeliz";
import { Registro } from "./pages/paseafeliz/Registro";
import { Login } from "./pages/paseafeliz/Login";
import { PanelUsuario } from "./pages/paseafeliz/PanelUsuario";
import { Reserva } from "./pages/paseafeliz/Reserva";
import { PerfilPaseador } from "./pages/paseafeliz/PerfilPaseador";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <>
      <Route path="/" element={<PaseaFeliz />} errorElement={<h1>Not found!</h1>} />
      <Route path="/paseafeliz" element={<PaseaFeliz />} />
      <Route path="/registro" element={<PublicOnlyRoute><Registro /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/panel" element={<ProtectedRoute allowedRoles={["cliente", "paseador", "admin"]}><PanelUsuario /></ProtectedRoute>} />
      <Route path="/reservar" element={<ProtectedRoute allowedRoles={["cliente"]}><Reserva /></ProtectedRoute>} />
      <Route path="/perfil-paseador" element={<ProtectedRoute allowedRoles={["paseador"]}><PerfilPaseador /></ProtectedRoute>} />
    </>
  )
);