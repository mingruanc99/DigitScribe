import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import springBootService from '../../src/services/SpringBootService.js';
import StackCard from '../components/StackCard';

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modelStatLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  segment: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listRowText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  mutedText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
    alignSelf: 'flex-start',
  },
  chipButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    gap: 4,
  },
  logoutTitle: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, language, setLanguage, colors, t } = useSettings();
  const { user, logout } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const displayName = user?.username || 'Guest';
  const [modelStats, setModelStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({ status: 'checking' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const modelUsageText = modelStats
    ? `${modelStats.activeModels ?? '—'} / ${modelStats.totalModels ?? '—'}`
    : t('settings.notAvailable');
  const datasetValue = modelStats?.totalTrainingSamples?.toLocaleString?.() || t('settings.notAvailable');
  const predictionValue = modelStats?.totalPredictions?.toLocaleString?.() || t('settings.notAvailable');
  const accuracyValue = modelStats?.averageAccuracy
    ? `${modelStats.averageAccuracy.toFixed(2)}%`
    : t('settings.notAvailable');
  const serverLabel = serverStatus?.status === 'healthy'
    ? t('home.statusHealthy')
    : serverStatus?.status === 'checking'
      ? t('home.statusChecking')
      : t('home.statusError');

  const themeOptions = [
    { key: 'system', label: t('settings.systemTheme') },
    { key: 'light', label: t('settings.lightTheme') },
    { key: 'dark', label: t('settings.darkTheme') },
  ];

  const languageOptions = [
    { key: 'en', label: t('settings.english') },
    { key: 'zh', label: t('settings.chinese') },
  ];

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const [analytics, status, server] = await Promise.all([
        springBootService.getAnalyticsOverview().catch(() => null),
        springBootService.getDatabaseStatus().catch(() => null),
        springBootService.healthCheck().catch(() => ({ status: 'error' })),
      ]);
      setModelStats(analytics);
      setDbStatus(status);
      setServerStatus(server);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSystems();
    }, [])
  );

  const confirmLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutDescription'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
            router.navigate('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t('settings.title')}</Text>
      <Text style={{ color: colors.textSecondary }}>
        {t('settings.profileSubtitle', { name: displayName })}
      </Text>

      <StackCard style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>{t('settings.appearance')}</Text>
          <Text style={styles.cardDescription}>{t('settings.themeDescription')}</Text>
        </View>
        <View style={styles.segment}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setTheme(option.key)}
              style={[
                styles.segmentButton,
                {
                  borderColor: theme === option.key ? colors.accent : colors.border,
                  backgroundColor: theme === option.key ? colors.accentMuted : colors.elevated,
                },
              ]}
            >
              <Text style={{
                color: theme === option.key ? '#fff' : colors.textPrimary,
                fontWeight: theme === option.key ? '700' : '500',
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </StackCard>

      <StackCard style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>{t('settings.language')}</Text>
          <Text style={styles.cardDescription}>{t('settings.languageDescription')}</Text>
        </View>
        <View style={styles.segment}>
          {languageOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setLanguage(option.key)}
              style={[
                styles.segmentButton,
                {
                  borderColor: language === option.key ? colors.accent : colors.border,
                  backgroundColor: language === option.key ? colors.accentMuted : colors.elevated,
                },
              ]}
            >
              <Text style={{
                color: language === option.key ? '#fff' : colors.textPrimary,
                fontWeight: language === option.key ? '700' : '500',
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </StackCard>

      <StackCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{t('settings.dataManagement')}</Text>
            <Text style={styles.cardDescription}>{t('settings.dataManagementDescription')}</Text>
          </View>
          <TouchableOpacity onPress={fetchSystems} style={styles.chipButton} disabled={loading}>
            <Text style={styles.chipButtonText}>
              {loading ? t('settings.loadingStats') : t('settings.refreshStats')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.modelStatLabel}>{t('settings.modelUsage')}</Text>
          <Text style={styles.listRowText}>{modelUsageText}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.modelStatLabel}>{t('settings.modelDataset')}</Text>
          <Text style={styles.listRowText}>{datasetValue}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.modelStatLabel}>{t('settings.modelPredictions')}</Text>
          <Text style={styles.listRowText}>{predictionValue}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.modelStatLabel}>{t('settings.modelAccuracy')}</Text>
          <Text style={styles.listRowText}>{accuracyValue}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.modelStatLabel}>{t('settings.serverStatusLabel')}</Text>
          <Text style={[styles.listRowText, { color: serverStatus?.status === 'healthy' ? '#22c55e' : colors.textPrimary }]}>
            {serverLabel}
          </Text>
        </View>
        {dbStatus?.message ? (
          <Text
            style={{
              color: dbStatus?.healthy ? '#16a34a' : '#f97316',
              fontSize: 13,
              marginTop: 6,
            }}
          >
            {dbStatus.message}
          </Text>
        ) : null}
        {lastUpdated ? (
          <Text style={[styles.mutedText, { marginTop: 4 }]}>
            {t('database.lastCheck', { time: new Date(lastUpdated).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US') })}
          </Text>
        ) : null}
      </StackCard>

      <StackCard style={styles.card}>
        <Text style={styles.cardTitle}>{t('settings.about')}</Text>
        <TouchableOpacity
          style={styles.listRow}
          onPress={() => router.push('/about')}
        >
          <Text style={styles.listRowText}>{t('settings.aboutTeam')}</Text>
          <Text style={styles.mutedText}>›</Text>
        </TouchableOpacity>
        <View style={[styles.listRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.listRowText}>{t('settings.version')}</Text>
          <Text style={styles.mutedText}>{version}</Text>
        </View>
      </StackCard>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutTitle}>{t('settings.logout')}</Text>
        <Text style={styles.mutedText}>{t('settings.logoutDescription')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
