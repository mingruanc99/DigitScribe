import { View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

const StackCard = ({ children, style, padding = 20, transparent = false }) => {
  const { colors } = useSettings();

  return (
    <View
      style={[
        {
          borderRadius: 24,
          padding,
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderWidth: transparent ? 0 : 1,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: transparent ? 0 : 0.18,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 22,
          elevation: transparent ? 0 : 12,
        },
        style,
      ]}
      testID="stack-card"
    >
      {children}
    </View>
  );
};

export default StackCard;
