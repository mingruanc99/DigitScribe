// Mock AsyncStorage for all tests - use factory function to avoid variable hoisting
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(() => Promise.resolve()),
      getItem: jest.fn(() => Promise.resolve(null)),
      removeItem: jest.fn(() => Promise.resolve()),
      mergeItem: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
      getAllKeys: jest.fn(() => Promise.resolve([])),
      multiGet: jest.fn(() => Promise.resolve([])),
      multiSet: jest.fn(() => Promise.resolve()),
      multiRemove: jest.fn(() => Promise.resolve()),
      multiMerge: jest.fn(() => Promise.resolve()),
    },
  };
});

// Mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    __esModule: true,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      isReady: true,
    }),
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: jest.fn(),
    useSegments: jest.fn(() => []),
    Stack: ({ children }) => React.createElement('Stack', null, children),
    Link: ({ children }) => React.createElement('Link', null, children),
  };
});

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock static assets (images, etc.)
jest.mock('../assets/images/favicon.png', () => 'mock-image-source');

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => {
  return {
    __esModule: true,
    default: {
      interop: () => ({}),
      useInteropValue: () => ({}),
    },
  };
});

// Mock react-native-svg with simple string mocks
jest.mock('react-native-svg', () => ({
  __esModule: true,
  Svg: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
  Rect: 'Rect',
  Line: 'Line',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  Text: 'Text',
  TSpan: 'TSpan',
  TextPath: 'TextPath',
  G: 'G',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
  ClipPath: 'ClipPath',
  Pattern: 'Pattern',
  Mask: 'Mask',
  Image: 'Image',
  Use: 'Use',
  Symbol: 'Symbol',
  ForeignObject: 'ForeignObject',
}));

// Mock react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('mock-base64-image-data')),
  captureScreen: jest.fn(() => Promise.resolve('mock-base64-screen-data')),
}));

// Mock LinearGradient from expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  __esModule: true,
  LinearGradient: 'LinearGradient',
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  __esModule: true,
  Ionicons: 'Ionicons',
}));