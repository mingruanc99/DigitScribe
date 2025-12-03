import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const { width: screenWidth } = Dimensions.get('window');

const HandwritingCanvas = forwardRef(({
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  style
}, ref) => {
  const [paths, setPaths] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const pathRef = useRef('');

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      setPaths([]);
      pathRef.current = '';
    },
    getCanvasData: () => {
      return {
        paths: paths,
        bounds: getBounds(),
        canvasSize: { width: screenWidth - 32, height: 300 }
      };
    },
    getBase64Image: async () => {
      try {
        return await captureRef(canvasRef, {
          format: 'png',
          quality: 0.9,
          result: 'base64'
        });
      } catch (error) {
        return null;
      }
    }
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current = `M ${locationX} ${locationY}`;
      setIsDrawing(true);

      if (onStrokeStart) {
        onStrokeStart({ x: locationX, y: locationY });
      }
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current += ` L ${locationX} ${locationY}`;

      // Update the last path in the array with the current drawing
      setPaths(prevPaths => {
        const newPaths = [...prevPaths];
        // If we're drawing, update the last path, otherwise add new one
        if (isDrawing && newPaths.length > 0) {
          newPaths[newPaths.length - 1] = pathRef.current;
        } else {
          newPaths.push(pathRef.current);
        }
        return newPaths;
      });

      if (onStrokeMove) {
        onStrokeMove({ x: locationX, y: locationY });
      }
    },

    onPanResponderRelease: () => {
      pathRef.current = '';
      setIsDrawing(false);

      if (onStrokeEnd) {
        onStrokeEnd();
      }
    },
  });

  const getBounds = () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    paths.forEach(path => {
      const matches = path.match(/[ML]\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g);
      if (matches) {
        matches.forEach(match => {
          const [, x, y] = match.match(/[ML]\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
          const px = parseFloat(x);
          const py = parseFloat(y);
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px);
          maxY = Math.max(maxY, py);
        });
      }
    });

    return { minX, minY, maxX, maxY };
  };

  return (
    <View style={[styles.container, style]} ref={canvasRef}>
      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Svg
          width="100%"
          height="100%"
          style={styles.svg}
          viewBox={`0 0 ${screenWidth - 32} 300`}
        >
          {/* Render all paths - including current drawing */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="#000000"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
});

export default HandwritingCanvas;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D4B996',
    borderStyle: 'dotted',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  svg: {
    backgroundColor: '#FFFFFF',
  },
});