import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSettings } from '../contexts/SettingsContext';
import SketchPreview from '../components/SketchPreview';
import StackCard from '../components/StackCard';

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  digit: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexBasis: '48%',
    borderRadius: 18,
    padding: 12,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default function Result() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const result = useMemo(() => {
    if (params?.result) {
      try {
        const parsed = JSON.parse(params.result);
        return {
          recognizedText: parsed.recognizedText || t('result.empty'),
          confidence: toNumber(parsed.confidence, 0),
          processingTime: parsed.processingTime || '—',
          language: parsed.language || 'Digits',
          wordCount: parsed.wordCount || 0,
          digit: parsed.digit ?? '-',
          modelUsed: parsed.modelUsed || '—',
          confidenceDistribution: parsed.confidenceDistribution || [],
          sequence: parsed.sequence || '',
          drawingPaths: parsed.drawingPaths || [],
          canvasSize: parsed.canvasSize,
        };
      } catch (error) {
        console.warn('Invalid result payload', error);
      }
    }
    return {
      recognizedText: t('result.empty'),
      confidence: 0,
      processingTime: '—',
      language: 'Digits',
      wordCount: 0,
      digit: '-',
      modelUsed: '—',
      confidenceDistribution: [],
      sequence: '',
      drawingPaths: [],
      canvasSize: null,
    };
  }, [params?.result, t]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <StackCard style={styles.card}>
          <Text style={styles.title}>{t('result.title')}</Text>
          <Text style={styles.subtitle}>{t('result.subtitle')}</Text>
          <Text style={styles.digit}>{result.digit}</Text>
          <Text style={styles.subtitle}>{result.recognizedText}</Text>
          {result.sequence ? (
            <Text style={styles.subtitle}>
              {t('home.sequenceTitle')}: {result.sequence}
            </Text>
          ) : null}
          <SketchPreview
            paths={result.drawingPaths}
            canvasSize={result.canvasSize}
            background={colors.elevated}
            borderColor={colors.border}
            style={{ height: 220, width: '100%' }}
          />
        </StackCard>

        <StackCard style={styles.card}>
          <Text style={styles.title}>{t('result.summary')}</Text>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('home.confidence')}</Text>
              <Text style={styles.statValue}>{result.confidence}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('home.processingTime')}</Text>
              <Text style={styles.statValue}>{result.processingTime}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('home.model')}</Text>
              <Text style={styles.statValue}>{result.modelUsed}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('result.language')}</Text>
              <Text style={styles.statValue}>{result.language}</Text>
            </View>
          </View>
        </StackCard>

        {result.confidenceDistribution?.length ? (
          <View style={styles.card}>
            <Text style={styles.title}>{t('result.distribution')}</Text>
            {result.confidenceDistribution.map((value, idx) => (
              <View key={idx} style={styles.barRow}>
                <Text style={styles.subtitle}>{idx}</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (value || 0) * 100)}%` }]} />
                </View>
                <Text style={styles.subtitle}>{((value || 0) * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.card, styles.actions]}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.buttonTextPrimary}>{t('result.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.buttonTextSecondary}>{t('result.back')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
