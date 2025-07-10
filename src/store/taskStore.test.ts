import { act, renderHook } from '@testing-library/react';
import { useTaskStore } from './taskStore';

describe('taskStore', () => {
  // Сбрасываем состояние перед каждым тестом
  beforeEach(() => {
    act(() => {
      useTaskStore.setState({ searchTerm: '' });
    });
  });

  it('should have an empty initial search term', () => {
    const { result } = renderHook(() => useTaskStore());
    expect(result.current.searchTerm).toBe('');
  });

  it('should update the search term when setSearchTerm is called', () => {
    const { result } = renderHook(() => useTaskStore());

    const newSearchTerm = 'find this task';

    act(() => {
      result.current.setSearchTerm(newSearchTerm);
    });

    expect(result.current.searchTerm).toBe(newSearchTerm);
  });
});