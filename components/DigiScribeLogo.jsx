import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const DigiScribeLogo = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]} testID="digiscribe-logo">
      <Image
        source={require('../assets/images/favicon.png')}
        style={styles.image}
        resizeMode="contain"
        testID="logo-image"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default DigiScribeLogo;
