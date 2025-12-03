import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteByRoleProps {
    children: React.ReactNode;
    requiredRole: 'estudiante' | 'profesor';
}

const ProtectedRouteByRole = ({ children, requiredRole }: ProtectedRouteByRoleProps) => {
    const { isAuthenticated, getUserRole } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getUserRole();
    
    if (userRole !== requiredRole) {
        // Si el usuario no tiene el rol requerido, redirigir a su vista correspondiente
        const redirectTo = userRole === 'profesor' ? '/docente' : '/seleccion-niveles';
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRouteByRole;
