import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 32;
const CANVAS_HEIGHT = 300;
const GRID_SIZE = 28;

const HandwritingCanvas = ({
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  onCanvasReady,
  onStrokeActivity,
  style,
  strokeColor = '#000000',
  backgroundColor = '#FFFFFF',
}, ref) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const canvasRef = useRef(null);
  const pathRef = useRef('');
  const svgRef = useRef(null);
  const captureTargetRef = useRef(null);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady();
    }
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current = `M ${locationX} ${locationY}`;
      setCurrentPath(pathRef.current);
      onStrokeActivity?.();

      if (onStrokeStart) {
        onStrokeStart({ x: locationX, y: locationY });
      }
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current += ` L ${locationX} ${locationY}`;
      setCurrentPath(pathRef.current);
      onStrokeActivity?.();

      if (onStrokeMove) {
        onStrokeMove({ x: locationX, y: locationY });
      }
    },

    onPanResponderRelease: () => {
      if (pathRef.current && pathRef.current.length > 0) {
        const finalizedPath = pathRef.current;
        setPaths(prevPaths => [...prevPaths, finalizedPath]);
      }

      setCurrentPath('');
      pathRef.current = '';
      onStrokeActivity?.();

      if (onStrokeEnd) {
        onStrokeEnd();
      }
    },
  });

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  };

  const getCanvasData = () => {
    const allPaths = [...paths, currentPath].filter(Boolean);
    return {
      paths: allPaths,
      bounds: getBounds(allPaths),
      canvasSize,
    };
  };

  const getBase64Image = async () => {
    try {
      if (Platform.OS === 'web') {
        return renderPathsToDataUrl();
      }

      if (!captureTargetRef.current) {
        return null;
      }

      const base64 = await captureRef(captureTargetRef.current, {
        format: 'png',
        quality: 1,
        result: 'base64'
      });
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.warn('Failed to capture canvas', error);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    clearCanvas,
    getCanvasData,
    getBase64Image,
    getNormalizedPixels,
  }));

  const getBounds = (targetPaths = [...paths, currentPath].filter(Boolean)) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    targetPaths.forEach(path => {
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

  const renderPathsToDataUrl = () => {
    if (typeof document === 'undefined') return null;
    const allPaths = [...paths, currentPath].filter(Boolean);
    if (allPaths.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    allPaths.forEach((path) => drawPathOnContext(ctx, path));
    return canvas.toDataURL('image/png');
  };

  const drawPathOnContext = (ctx, pathStr) => {
    ctx.beginPath();
    const regex = /([ML])\s+([\d.]+)\s+([\d.]+)/g;
    let match;
    while ((match = regex.exec(pathStr)) !== null) {
      const [, command, xStr, yStr] = match;
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      if (command === 'M') {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const parsePathPoints = (pathStr) => {
    const regex = /([ML])\s+([\d.]+)\s+([\d.]+)/g;
    const points = [];
    let match;
    while ((match = regex.exec(pathStr)) !== null) {
      const [, , xStr, yStr] = match;
      points.push({ x: parseFloat(xStr), y: parseFloat(yStr) });
    }
    return points;
  };

  const drawLineSegment = (pixels, start, end) => {
    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
    for (let i = 0; i <= steps; i += 2) {
      const t = steps === 0 ? 0 : i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      stampBrush(pixels, x, y);
    }
  };

  const stampBrush = (pixels, x, y) => {
    const brushRadius = 1.2;
    const gridWidth = GRID_SIZE;
    const gridHeight = GRID_SIZE;
    const normX = (x / canvasSize.width) * (gridWidth - 1);
    const normY = (y / canvasSize.height) * (gridHeight - 1);
    const minX = Math.max(0, Math.floor(normX - brushRadius));
    const maxX = Math.min(gridWidth - 1, Math.ceil(normX + brushRadius));
    const minY = Math.max(0, Math.floor(normY - brushRadius));
    const maxY = Math.min(gridHeight - 1, Math.ceil(normY + brushRadius));
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const idx = gy * gridWidth + gx;
        pixels[idx] = Math.min(1, pixels[idx] + 0.5);
      }
    }
  };

  const getNormalizedPixels = () => {
    const allPaths = [...paths, currentPath].filter(Boolean);
    if (allPaths.length === 0) {
      return null;
    }
    const pixels = new Float32Array(GRID_SIZE * GRID_SIZE).fill(0);
    allPaths.forEach((path) => {
      const points = parsePathPoints(path);
      if (points.length === 1) {
        stampBrush(pixels, points[0].x, points[0].y);
        return;
      }
      for (let i = 0; i < points.length - 1; i++) {
        drawLineSegment(pixels, points[i], points[i + 1]);
      }
    });
    // normalize intensities to 0-1 and clamp
    const normalized = Array.from(pixels, (value) => Math.min(1, value));
    return normalized;
  };

  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      ref={canvasRef}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width && height) {
          setCanvasSize({ width, height });
        }
      }}
    >
      <View
        style={[styles.canvasWrapper, { backgroundColor }]}
        ref={captureTargetRef}
        {...panResponder.panHandlers}
      >
        <Svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={styles.svg}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        >
          {/* Render all completed paths */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={strokeColor}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Render current drawing path */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={strokeColor}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
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
  },
  svg: {
    flex: 1,
  },
});

export default forwardRef(HandwritingCanvas);
