import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function InstructorRoute({ children }) {
  const { isAdmin, isInstructor, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0f1e' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ color: '#3b82f6', fontWeight: '600' }}>Verifying instructor access...</p>
      </div>
    </div>
  );

  // Admins also have instructor access
  if (!isAdmin && !isInstructor) return <Navigate to="/dashboard" />;

  return children;
}
