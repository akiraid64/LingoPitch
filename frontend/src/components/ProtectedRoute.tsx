import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-primary-500"></div>
            </div>
        );
    }

    return user ? <>{children}</> : <Navigate to="/login" replace />;
}
