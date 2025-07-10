import { Navigate, Outlet } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';

const ProtectedRoute = () => {
  const isAuthenticated = useTaskStore((state) => state.isAuthenticated);
  const isAuthInitialized = useTaskStore((state) => state.isAuthInitialized);

  // Если мы еще не проверили сессию, ничего не рендерим (или показываем глобальный спиннер).
  // AuthProvider уже занимается этим, но для надежности оставим проверку.
  if (!isAuthInitialized) {
    return <div>Loading...</div>; // Этот экран теперь будет виден очень короткое время
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
