import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import springBootService from '../src/services/SpringBootService.js';
import { useSettings } from '../src/context/SettingsContext';
import StackCard from './components/StackCard';

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  statusCard: {
    gap: 6,
  },
  statusOk: {
    borderColor: '#16a34a',
  },
  statusFail: {
    borderColor: '#dc2626',
  },
  statusTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  statusMessage: {
    color: colors.textSecondary,
  },
  statusMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  overviewCard: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loadingBox: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorBanner: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: 'rgba(220,38,38,0.1)',
    margin: 16,
    gap: 6,
  },
  errorText: {
    color: colors.textPrimary,
  },
  retryText: {
    color: colors.accent,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString() : value;

export default function Database() {
  const { colors, t, language } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [analytics, setAnalytics] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTime = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US');
    } catch (err) {
      return iso;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsPayload, dbPayload] = await Promise.all([
        springBootService.getAnalyticsOverview().catch(() => null),
        springBootService.getDatabaseStatus(),
      ]);
      setAnalytics(analyticsPayload);
      setDbStatus(dbPayload);
    } catch (err) {
      setError(err.message || 'Failed to load database data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => ({
    datasetSize: analytics?.totalTrainingSamples ?? 70000,
    totalPredictions: analytics?.totalPredictions ?? 0,
    averageAccuracy: analytics?.averageAccuracy ?? 0,
    activeModels: analytics?.activeModels ?? 0,
    totalModels: analytics?.totalModels ?? 0,
  }), [analytics]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('database.title')}</Text>
        <Text style={styles.subtitle}>{t('database.subtitle')}</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData}>
            <Text style={styles.retryText}>{t('database.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {dbStatus ? (
          <StackCard
            style={[
              styles.statusCard,
              dbStatus.healthy ? styles.statusOk : styles.statusFail,
            ]}
            padding={18}
          >
            <Text style={styles.statusTitle}>{t('database.statusTitle')}</Text>
            <Text style={styles.statusMessage}>{dbStatus.message}</Text>
            <Text style={styles.statusMeta}>
              {t('database.lastCheck', { time: formatTime(dbStatus.checkedAt) })}
            </Text>
          </StackCard>
        ) : null}

        <StackCard style={styles.overviewCard}>
          <Text style={styles.cardTitle}>{t('database.subtitle')}</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('database.datasetSize')}</Text>
            <Text style={styles.statValue}>{formatNumber(stats.datasetSize)} samples</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('database.totalPredictions')}</Text>
            <Text style={styles.statValue}>{formatNumber(stats.totalPredictions)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('database.activeModels')}</Text>
            <Text style={styles.statValue}>
              {stats.activeModels} / {stats.totalModels}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('database.averageAccuracy')}</Text>
            <Text style={styles.statValue}>
              {stats.averageAccuracy ? `${stats.averageAccuracy.toFixed(2)}%` : '—'}
            </Text>
          </View>
        </StackCard>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.errorText}>{t('database.loading')}</Text>
          </View>
        ) : null}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchData}>
            <Text style={styles.primaryButtonText}>{t('database.refresh')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t('database.export')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
