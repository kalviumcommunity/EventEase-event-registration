import { useAuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuthContext();

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
};
