import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-wa-bg-light">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-wa-teal font-medium">Verifying admin access...</p>
      </div>
    </div>
  );

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return children;
}