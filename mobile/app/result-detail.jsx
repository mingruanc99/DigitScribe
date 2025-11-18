import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSettings } from '../src/context/SettingsContext';
import SketchPreview from './components/SketchPreview';
import StackCard from './components/StackCard';

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mediaCard: {
    alignItems: 'center',
  },
  handwritingImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  resultCard: {},
  resultText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  detailsCard: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: colors.textSecondary,
  },
  detailValue: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.textSecondary,
  },
});

export default function ResultDetail() {
  const params = useLocalSearchParams();
  const { colors, t, language } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const result = useMemo(() => {
    if (!params?.result) return null;
    try {
      return JSON.parse(params.result);
    } catch (error) {
      console.warn('Invalid result payload', error);
      return null;
    }
  }, [params?.result]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
    } catch (error) {
      return value;
    }
  };

  if (!result) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{t('resultDetail.error')}</Text>
      </View>
    );
  }

  const hasDrawing = Array.isArray(result.drawingPaths) && result.drawingPaths.length > 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('resultDetail.title')}</Text>
        <Text style={styles.subtitle}>{result.name || t('resultDetail.subtitleFallback')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resultDetail.original')}</Text>
          <StackCard style={styles.mediaCard} padding={16}>
            {hasDrawing ? (
              <SketchPreview
                paths={result.drawingPaths}
                canvasSize={result.canvasSize}
                borderColor={colors.border}
                background={colors.surface}
                stroke={colors.textPrimary}
                style={{ width: '100%', height: 240 }}
              />
            ) : result.image ? (
              <Image source={{ uri: result.image }} style={styles.handwritingImage} resizeMode="contain" />
            ) : null}
          </StackCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resultDetail.recognition')}</Text>
          <StackCard style={styles.resultCard} padding={20}>
            <Text style={styles.resultText}>{result.text || result.recognizedText}</Text>
          </StackCard>
        </View>

        <View style={[styles.section, styles.metricsContainer]}>
          <StackCard style={[styles.metricCard, { borderRadius: 18 }]} padding={14}>
            <Text style={styles.metricLabel}>{t('resultDetail.confidence')}</Text>
            <Text style={styles.metricValue}>{result.confidence}%</Text>
          </StackCard>
          <StackCard style={[styles.metricCard, { borderRadius: 18 }]} padding={14}>
            <Text style={styles.metricLabel}>{t('resultDetail.latency')}</Text>
            <Text style={styles.metricValue}>{result.recognitionTime || result.processingTime}</Text>
          </StackCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('resultDetail.details')}</Text>
          <StackCard style={styles.detailsCard} padding={16}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('home.sequenceTitle')}:</Text>
              <Text style={styles.detailValue}>{result.sequence || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('resultDetail.language')}:</Text>
              <Text style={styles.detailValue}>{result.language || 'Digits'}</Text>
            </View>
            {result.wordCount ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('resultDetail.words')}:</Text>
                <Text style={styles.detailValue}>{result.wordCount}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('resultDetail.idLabel')}:</Text>
              <Text style={styles.detailValue}>#{result.id || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('resultDetail.dateLabel')}:</Text>
              <Text style={styles.detailValue}>{formatDate(result.timestamp || result.date)}</Text>
            </View>
          </StackCard>
        </View>
      </View>
    </ScrollView>
  );
}
