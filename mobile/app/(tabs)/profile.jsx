import { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useHistory } from '../../src/context/HistoryContext';
import { useSettings } from '../../src/context/SettingsContext';
import SketchPreview from '../components/SketchPreview';
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
  heroCard: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  latestCard: {
    gap: 16,
  },
  latestDigit: {
    fontSize: 72,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  viewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  viewChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  historyCard: {
    gap: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  historyAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
  },
  historyActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyActionPrimary: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  historyActionPrimaryText: {
    color: '#fff',
  },
  historyActionDestructive: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248,113,113,0.12)',
  },
  historyActionDestructiveText: {
    color: '#dc2626',
  },
  historyItem: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryMeta: {
    flex: 1,
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  entrySubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  entryStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.elevated,
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionsCard: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  actionHint: {
    color: colors.textSecondary,
  },
});

const formatDate = (timestamp, locale = 'en-US') => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    return timestamp;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { entries, clearEntries, loading } = useHistory();
  const { colors, t, language } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const displayName = user?.username || 'Guest';
  const recognitions = entries.length;
  const sequences = new Set(entries.map((entry) => entry.sequence).filter(Boolean)).size;
  const latestEntry = entries[0];
  const historyEntries = showAllHistory ? entries : entries.slice(0, 5);
  const canExpand = entries.length > 5;

  const confirmClear = () => {
    Alert.alert(
      t('profile.clearHistory'),
      t('profile.clearHistoryMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('profile.clearHistory'),
          style: 'destructive',
          onPress: clearEntries,
        },
      ]
    );
  };

  const renderHistoryItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.historyItem}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/result', params: { result: JSON.stringify(item) } })}
    >
      <SketchPreview
        paths={item.drawingPaths}
        canvasSize={item.canvasSize}
        background={colors.elevated}
        borderColor={colors.border}
        style={{ width: 96, height: 96 }}
      />
      <View style={styles.entryMeta}>
        <View>
          <Text style={styles.entryTitle}>{t('profile.predictionLabel', { digit: item.digit })}</Text>
          <Text style={styles.entrySubtitle}>
            {t('profile.savedAt', { date: formatDate(item.timestamp, language === 'zh' ? 'zh-CN' : 'en-US') })}
          </Text>
          {item.sequence ? (
            <Text style={styles.entrySubtitle}>{t('home.sequenceTitle')}: {item.sequence}</Text>
          ) : null}
        </View>
        <View style={styles.entryStats}>
          <Text style={styles.statPill}>{t('home.confidence')}: {item.confidence}%</Text>
          <Text style={styles.statPill}>{t('home.model')}: {item.modelUsed}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t('profile.pageTitle')}</Text>

      <StackCard style={styles.heroCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileMeta}>{user?.email || '—'}</Text>
            <Text style={styles.profileMeta}>{t('settings.profileSubtitle', { name: displayName })}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('settings.recognitions')}</Text>
            <Text style={styles.statValue}>{recognitions}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('settings.sequences')}</Text>
            <Text style={styles.statValue}>{sequences}</Text>
          </View>
        </View>
      </StackCard>

      <StackCard style={styles.latestCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            {t('profile.latestTitle')}
          </Text>
          {latestEntry ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/result', params: { result: JSON.stringify(latestEntry) } })}
              style={styles.viewChip}
            >
              <Text style={styles.viewChipText}>{t('home.viewDetails')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {latestEntry ? (
          <>
            <Text style={styles.latestDigit}>{latestEntry.digit}</Text>
            <View style={styles.entryStats}>
              <Text style={styles.statPill}>{t('home.confidence')}: {latestEntry.confidence}%</Text>
              <Text style={styles.statPill}>{t('home.model')}: {latestEntry.modelUsed}</Text>
              <Text style={styles.statPill}>{latestEntry.processingTime}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.profileMeta}>{t('profile.latestEmpty')}</Text>
        )}
      </StackCard>

      <StackCard style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{t('profile.historyTitle')}</Text>
            <Text style={{ color: colors.textSecondary }}>{t('profile.historySubtitle')}</Text>
          </View>
          <View style={styles.historyActions}>
            {canExpand ? (
              <TouchableOpacity
                onPress={() => setShowAllHistory((prev) => !prev)}
                style={[styles.historyAction, styles.historyActionPrimary]}
              >
                <Text style={[styles.historyActionText, styles.historyActionPrimaryText]}>
                  {showAllHistory ? t('profile.showLess') : t('profile.showAll')}
                </Text>
              </TouchableOpacity>
            ) : null}
            {entries.length > 0 ? (
              <TouchableOpacity
                onPress={confirmClear}
                style={[styles.historyAction, styles.historyActionDestructive]}
              >
                <Text style={[styles.historyActionText, styles.historyActionDestructiveText]}>
                  {t('profile.clearHistory')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.entrySubtitle}>{t('profile.emptyTitle')}</Text>
            <Text style={styles.entrySubtitle}>{t('profile.emptySubtitle')}</Text>
          </View>
        ) : (
          historyEntries.map(renderHistoryItem)
        )}
      </StackCard>

      <StackCard style={styles.actionsCard}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{t('profile.actionsTitle')}</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/signin')}>
          <Text style={styles.actionText}>{t('settings.manageAccount')}</Text>
          <Text style={styles.actionHint}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/about')}>
          <Text style={styles.actionText}>{t('settings.support')}</Text>
          <Text style={styles.actionHint}>›</Text>
        </TouchableOpacity>
      </StackCard>
    </ScrollView>
  );
}
