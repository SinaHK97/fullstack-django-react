import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RouteDetail from "@/pages/RouteDetail";
import { useSelector } from "react-redux";
import { setGlobalHandlers } from "@/app/api";
// import { WebSocketProvider } from "@/contexts/WebSocketContext";
import type { RootState } from "@/app/store";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  return (token && isAuthenticated) ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Initialize global handlers for 401 redirects
  useEffect(() => {
    setGlobalHandlers(
      (path: string) => navigate(path, { replace: true }),
      (action: any) => dispatch(action)
    );
  }, [navigate, dispatch]);

  return (
    // <WebSocketProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/routes/:id" element={<PrivateRoute><RouteDetail /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    // </WebSocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
