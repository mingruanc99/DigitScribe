import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, language, setLanguage, t, theme } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const SettingsSection = ({ title, children }) => (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingsRow = ({ title, subtitle, onPress, hasSwitch, value, onValueChange }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}
      onPress={hasSwitch ? undefined : onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333333', true: '#ffffff' }}
          thumbColor={value ? '#000000' : '#666666'}
        />
      ) : (
        <Text style={[styles.rowArrow, { color: theme.colors.textSecondary }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const handleToggleLanguage = () => {
    // Toggle between English and Chinese
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
  };

  const getLanguageSubtitle = () => {
    return language === 'en' ? t('englishUS') : t('chinese');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings')}</Text>
      </View>

      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <SettingsSection title={t('preferences')}>
          <SettingsRow
            title={t('darkMode')}
            subtitle={t('darkModeDesc')}
            hasSwitch
            value={isDarkMode}
            onValueChange={handleToggleDarkMode}
          />
          <SettingsRow
            title={t('appLanguage')}
            subtitle={getLanguageSubtitle()}
            onPress={handleToggleLanguage}
          />
          <SettingsRow
            title={t('outputFormat')}
            subtitle={t('plainText')}
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title={t('privacySecurity')}>
          <SettingsRow
            title={t('analytics')}
            subtitle={t('analyticsDesc')}
            hasSwitch
            value={analytics}
            onValueChange={setAnalytics}
          />
        </SettingsSection>

        <SettingsSection title={t('about')}>
          <SettingsRow
            title={t('aboutTeam')}
            subtitle={t('aboutTeamDesc')}
            onPress={() => router.push('/about')}
          />
          <SettingsRow
            title={t('appVersion')}
            subtitle={t('version')}
            onPress={() => {}}
          />
        </SettingsSection>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
  },
  rowArrow: {
    fontSize: 20,
  },
});