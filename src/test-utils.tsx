import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Создаем клиент, который будет использоваться во всех тестах
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Отключаем повторные запросы в тестах для стабильности
      retry: false,
    },
  },
});

// Наша обертка, которая предоставляет все необходимые контексты
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Переопределяем стандартную функцию render
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Экспортируем все из testing-library, но заменяем render на нашу кастомную
export * from '@testing-library/react';
export { customRender as render };
