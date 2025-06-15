import { renderHook, act } from '@testing-library/react-native';
import { useToast } from '../../src/hooks/useToast';

describe('useToast', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toast.visible).toBe(false);
    expect(result.current.toast.message).toBe('');
    expect(result.current.toast.type).toBe('info');
  });

  it('should show toast with message and type', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Test message', 'success');
    });
    
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe('Test message');
    expect(result.current.toast.type).toBe('success');
  });

  it('should hide toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Test message', 'success');
    });
    
    expect(result.current.toast.visible).toBe(true);
    
    act(() => {
      result.current.hideToast();
    });
    
    expect(result.current.toast.visible).toBe(false);
  });

  it('should show success toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Success message');
    });
    
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe('Success message');
    expect(result.current.toast.type).toBe('success');
  });

  it('should show error toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showError('Error message');
    });
    
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe('Error message');
    expect(result.current.toast.type).toBe('error');
  });

  it('should show warning toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showWarning('Warning message');
    });
    
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe('Warning message');
    expect(result.current.toast.type).toBe('warning');
  });

  it('should show info toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showInfo('Info message');
    });
    
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe('Info message');
    expect(result.current.toast.type).toBe('info');
  });
});