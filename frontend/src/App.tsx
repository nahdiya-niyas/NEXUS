
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetails from "./pages/ModuleDetails";
import Calendar from "./pages/Calendar";
import PrivateFiles from "./pages/PrivateFiles";
import Assignments from "./pages/Assignments";
import AssignmentDetails from "./pages/AssignmentDetails";

import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerModules from "./pages/LecturerModules";
import LecturerModuleDetails from "./pages/LecturerModuleDetails";
import LecturerAssignments from "./pages/LecturerAssignments";
import CreateLecturerAssignment from "./pages/CreateLecturerAssignment";
import LecturerAssignmentDetails from "./pages/LecturerAssignmentDetails";
import LecturerResources from "./pages/LecturerResources";
import LecturerSubmissions from "./pages/LecturerSubmissions";
import LecturerSubmissionAssignments from "./pages/LecturerSubmissionAssignments";

import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminModules from "./pages/AdminModules";
import AdminEnrollments from "./pages/AdminEnrollments";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ==================== PUBLIC ==================== */}

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* ==================== STUDENT ==================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/modules"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Modules />
              </ProtectedRoute>
            }
          />

          <Route
            path="/modules/:id"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <ModuleDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Calendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/private-files"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <PrivateFiles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Assignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <AssignmentDetails />
              </ProtectedRoute>
            }
          />


          {/* ==================== LECTURER ==================== */}

          <Route
            path="/lecturer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/modules"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerModules />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/modules/:id"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerModuleDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/assignments"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerAssignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/assignments/create"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <CreateLecturerAssignment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerAssignmentDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/resources"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerResources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/submissions"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerSubmissions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/submissions/:moduleId"
            element={
              <ProtectedRoute allowedRoles={["LECTURER"]}>
                <LecturerSubmissionAssignments />
              </ProtectedRoute>
            }
          />


          {/* ==================== ADMIN ==================== */}

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/modules"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminModules />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminEnrollments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />


          {/* ==================== ACCOUNT ==================== */}          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
