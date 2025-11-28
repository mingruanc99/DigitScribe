import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Landing from '../app/index';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('<Landing />', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
    useRouter.mockReturnValue({
      replace: mockReplace,
      isReady: jest.fn(() => true),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders null (no UI)', () => {
    const { toJSON } = render(<Landing />);
    expect(toJSON()).toBeNull();
  });

  test('navigates to tabs after mount', async () => {
    render(<Landing />);

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  test('clears timeout on unmount', () => {
    const { unmount } = render(<Landing />);
    unmount();
    jest.advanceTimersByTime(100);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
