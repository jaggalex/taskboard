import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTaskStore } from '../store/taskStore';
import * as api from '../api';

// Этот компонент-обертка не рендерит ничего, кроме дочерних элементов,
// но его задача - выполнить запрос на проверку сессии при загрузке.
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useTaskStore((state) => state.setUser);
  const setAuthInitialized = useTaskStore((state) => state.setAuthInitialized);

  const { data, isSuccess, isError } = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess) {
      setUser(data.data.user);
    }
    // Мы устанавливаем isAuthInitialized в true, когда запрос завершился
    // (успешно или с ошибкой).
    if (isSuccess || isError) {
      setAuthInitialized(true);
    }
  }, [isSuccess, isError, data, setUser, setAuthInitialized]);

  return <>{children}</>;
};

export default AuthProvider;
