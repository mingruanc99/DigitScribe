import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

// Simple test to verify Jest setup works
describe('Simple Test', () => {
  test('renders text correctly', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });
});