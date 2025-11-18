import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_SIZE = { width: 300, height: 300 };

const SketchPreview = ({
  paths = [],
  canvasSize = DEFAULT_SIZE,
  stroke = '#0f172a',
  background = '#ffffff',
  borderColor = '#e2e8f0',
  style,
}) => {
  const width = canvasSize?.width || DEFAULT_SIZE.width;
  const height = canvasSize?.height || DEFAULT_SIZE.height;

  return (
    <View style={[styles.container, { backgroundColor: background, borderColor }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {paths?.map?.((path, idx) => (
          <Path
            key={`${path}-${idx}`}
            d={path}
            stroke={stroke}
            strokeWidth={width / 60}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    aspectRatio: 1,
  },
});

export default SketchPreview;
