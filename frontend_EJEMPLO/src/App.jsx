import "./reset.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import NotFoundPage from "./pages/notFoundPage";
import AdminLayout from "./components/admin/adminLayout";
import AdminDashboard from "./components/admin/adminDashboard.jsx";
import AdminLogin from "./components/admin/adminLogin.jsx";
import RegistroAutomotoras from "./components/admin/registroAutomotora.jsx";
import EditarAutomotoras from "./components/admin/editarAutomotora.jsx";
import EliminarAutomotoras from "./components/admin/eliminarAutomotora.jsx";
import RegistroAutos from "./components/admin/registroVehiculo.jsx";
import EditarRecorridoAutos from "./components/admin/editarRecorridoVehiculo.jsx";
import EliminarAutos from "./components/admin/eliminarVehiculo.jsx";
import ListaAutomotoras from "./components/admin/listaAutomotoras.jsx";
import ListaAutomoviles from "./components/admin/listaAutomoviles.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import RegistroSucursal from "./components/admin/registroSucursal.jsx";
import EditarSucursal from "./components/admin/editarSucursal.jsx";
import ZonaSinCobertura from "./components/admin/zonaSinCobertura.jsx";
import { ListaSucursalesRanking } from "./components/admin/ListaSucursalesRanking.jsx";

export const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/administrador" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="automotoras" element={<ListaAutomotoras />} />
            <Route path="automoviles" element={<ListaAutomoviles />} />
            <Route
              path="sucursales-ranking"
              element={<ListaSucursalesRanking />}
            />
            <Route path="login" element={<AdminLogin />} />
            <Route
              path="registro-automotoras"
              element={<RegistroAutomotoras />}
            />
            <Route
              path="editar-automotoras/:id"
              element={<EditarAutomotoras />}
            />
            <Route path="registro-autos" element={<RegistroAutos />} />
            <Route
              path="editar-recorrido-autos/:id"
              element={<EditarRecorridoAutos />}
            />
            <Route path="eliminar-autos/:id" element={<EliminarAutos />} />
            <Route
              path="registro-sucursal/:idAutomotora"
              element={<RegistroSucursal />}
            />
            <Route
              path="editar-sucursal/:idSucursal"
              element={<EditarSucursal />}
            />
            <Route path="zona-cobertura" element={<ZonaSinCobertura />} />
          </Route>
          {/* Ruta para manejar cualquier URL no encontrada */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};
export default App;
