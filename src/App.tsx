import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import HomePage from "./pages/HomePage/HomePage";
import RecursosPage from "./pages/RecursosPage/RecursosPage";
import PrestamoPage from "./pages/PrestamoPage/PrestamoPage";
import InvestigacionPage from "./pages/InvestigacionPage/InvestigacionPage"
import Estudiantes from "./pages/EstudiantesProfesor/EstudiantesProfesor"
import Usuarios from "./pages/EstudiantesProfesor/UsuariosGeneral"
import PrestamosAdmin from "./pages/PrestamoPage/PrestamosAdmin";
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Página pública */}
          <Route index path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/recursos" element={<RecursosPage />} />
          </Route>
          {/* Dashboard Layout - TODAS las rutas dentro del layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Rutas del Dashboard */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="docente/dashboard" element={<TeacherDashboard />} />
              <Route path="estudiante/dashboard" element={<UserDashboard />} />
              <Route path="/prestamos" element={<PrestamoPage />} />
              <Route path="/tesis-pasantias" element={<InvestigacionPage />} />
              <Route path="/estudiantes" element={<Estudiantes />}></Route>
              <Route path="/users" element={<Usuarios />}></Route>
              <Route path="/loans"element= {<PrestamosAdmin/>}/>
            </Route>
          </Route>

          {/* Auth Layout - Rutas públicas */}
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}