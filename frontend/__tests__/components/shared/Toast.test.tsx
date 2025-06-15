import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Toast from '../../../src/components/shared/Toast';

describe('Toast', () => {
  const defaultProps = {
    visible: true,
    message: 'Test message',
    type: 'info' as const,
    onHide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(<Toast {...defaultProps} />);
    expect(getByText('Test message')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<Toast {...defaultProps} visible={false} />);
    expect(queryByText('Test message')).toBeNull();
  });

  it('displays correct icon for success type', () => {
    const { getByText } = render(<Toast {...defaultProps} type="success" />);
    expect(getByText('✅')).toBeTruthy();
  });

  it('displays correct icon for error type', () => {
    const { getByText } = render(<Toast {...defaultProps} type="error" />);
    expect(getByText('❌')).toBeTruthy();
  });

  it('displays correct icon for warning type', () => {
    const { getByText } = render(<Toast {...defaultProps} type="warning" />);
    expect(getByText('⚠️')).toBeTruthy();
  });

  it('displays correct icon for info type', () => {
    const { getByText } = render(<Toast {...defaultProps} type="info" />);
    expect(getByText('ℹ️')).toBeTruthy();
  });

  it('calls onHide when pressed', () => {
    const onHide = jest.fn();
    const { getByText } = render(<Toast {...defaultProps} onHide={onHide} />);
    
    fireEvent.press(getByText('Test message'));
    expect(onHide).toHaveBeenCalled();
  });

  it('auto-hides after duration', async () => {
    const onHide = jest.fn();
    render(<Toast {...defaultProps} onHide={onHide} duration={100} />);
    
    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    }, { timeout: 500 });
  });
});