
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Legal Insight</h1>
          <p className="mt-2 text-sm text-gray-600">
            Plateforme d'extraction automatisée de données de factures
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
