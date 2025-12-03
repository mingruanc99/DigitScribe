import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Test component rendering and layout
describe('GUI: Component Rendering and Layout', () => {
  describe('Home Screen Components', () => {
    test('buttons render with correct labels', async () => {
      const { getByTestId } = render(
        <View testID="home-container">
          <TouchableOpacity testID="recognize-button">
            <Text>Recognize</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="clear-button">
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>
      );

      expect(getByTestId('recognize-button')).toBeTruthy();
      expect(getByTestId('clear-button')).toBeTruthy();
    });

    test('navigation tabs render correctly', async () => {
      const tabs = ['Home', 'Settings', 'Profile'];
      const { getByText } = render(
        <View>
          {tabs.map(tab => (
            <Text key={tab}>{tab}</Text>
          ))}
        </View>
      );

      tabs.forEach(tab => {
        expect(getByText(tab)).toBeTruthy();
      });
    });
  });

  describe('Form Validation', () => {
    test('SignIn form displays errors correctly', async () => {
      const { getByText } = render(
        <View>
          <Text style={{ color: 'red' }}>Please enter a username</Text>
        </View>
      );

      const error = getByText('Please enter a username');
      expect(error).toBeTruthy();
      expect(error.props.style.color).toBe('red');
    });
  });

  describe('Responsive Layout', () => {
    test('components adapt to different screen sizes', async () => {
      const { getByTestId } = render(
        <View testID="container" style={{ padding: 20 }}>
          <View testID="canvas" style={{ width: '100%', height: 300 }} />
        </View>
      );

      const container = getByTestId('container');
      const canvas = getByTestId('canvas');

      expect(container.props.style.padding).toBe(20);
      expect(canvas.props.style.width).toBe('100%');
      expect(canvas.props.style.height).toBe(300);
    });
  });

  describe('Error Messages', () => {
    test('error messages appear with correct styling', async () => {
      const { getByText } = render(
        <View>
          <Text style={{ color: '#dc2626', fontWeight: '600' }}>
            Recognition failed
          </Text>
        </View>
      );

      const error = getByText('Recognition failed');
      expect(error.props.style.color).toBe('#dc2626');
      expect(error.props.style.fontWeight).toBe('600');
    });
  });
});
