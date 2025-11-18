import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSettings } from '../../src/context/SettingsContext';
import DigiScribeLogo from '../components/DigiScribeLogo';

const TabLabel = ({ icon, label, color, focused, colors }) => (
  <View style={{ alignItems: 'center', width: 74 }}>
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.accentMuted : colors.surface,
        borderWidth: 1,
        borderColor: focused ? colors.accent : colors.border,
      }}
    >
      <Ionicons name={icon} size={18} color={focused ? colors.accent : color} />
    </View>
    <Text
      style={{ color, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 4 }}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  const { colors, t } = useSettings();

  const CenterTabButton = (props) => {
    const focused = props.accessibilityState?.selected;
    return (
      <TouchableOpacity
        {...props}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            width: 110,
            height: 110,
            marginTop: -40,
            marginBottom: 8,
            borderRadius: 55,
            backgroundColor: focused ? colors.accent : colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <DigiScribeLogo size={48} />
          <Text
            style={{
              color: focused ? '#fff' : colors.textPrimary,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {t('tabs.center')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 8,
          paddingHorizontal: 12,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabLabel icon="person" label={t('tabs.profile')} color={color} focused={focused} colors={colors} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.center'),
          headerShown: false,
          tabBarButton: (props) => <CenterTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabLabel icon="settings" label={t('tabs.settings')} color={color} focused={focused} colors={colors} />
          ),
          headerTitle: t('settings.title'),
        }}
      />
    </Tabs>
  );
}
