import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Animated,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StackCard from '../../components/StackCard';
import { useRouter } from 'expo-router';
import HandwritingCanvas from '../../components/HandwritingCanvas';
import springBootService from '../../services/SpringBootService.js';
import DigiScribeLogo from '../../components/DigiScribeLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useHistory } from '../../contexts/HistoryContext';

const AUTO_RECOGNITION_DELAY = 1800;

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  heroGradient: {
    padding: 20,
    borderRadius: 28,
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  infoButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  canvasCard: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  canvas: {
    height: 260,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  predictionCard: {
    gap: 10,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  predictionDigit: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  predictionMeta: {
    flex: 1,
    gap: 4,
  },
  canvasActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
  },
  recognizeButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: colors.surface,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalList: {
    gap: 8,
  },
  modalItem: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { colors, t, isDark } = useSettings();
  const { entries, addEntry } = useHistory();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [autoRecognitionEnabled, setAutoRecognitionEnabled] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);
  const canvasRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const hasInkRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => () => {
    clearTimeout(inactivityTimerRef.current);
  }, []);

  useEffect(() => {
    if (!latestResult && entries.length > 0) {
      setLatestResult(entries[0]);
    }
  }, [entries, latestResult]);

  // Check if user just logged in and has a pending entry
  useEffect(() => {
    if (isAuthenticated && pendingEntry) {
      // Save the pending entry now that user is logged in
      addEntry(pendingEntry);
      setPendingEntry(null);
      Alert.alert(
        'Success!',
        'Your recognition history has been saved.',
        [{ text: 'OK' }]
      );
    }
  }, [isAuthenticated, pendingEntry, addEntry]);

  const scheduleAutoRecognition = () => {
    if (!autoRecognitionEnabled) return;
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      handleRecognize({ silent: true });
    }, AUTO_RECOGNITION_DELAY);
  };

  const clearTimers = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
  };

  const handleStrokeActivity = () => {
    hasInkRef.current = true;
    scheduleAutoRecognition();
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    hasInkRef.current = false;
    clearTimers();
  };

  const buildResultPayload = (response) => {
    const confidence = Math.round((response.confidence || 0) * 100);
    return {
      id: Date.now().toString(),
      digit: response.predicted_digit,
      confidence,
      processingTime: response.processing_time_ms ? `${response.processing_time_ms} ms` : '—',
      modelUsed: response.model_used || '—',
      timestamp: new Date().toISOString(),
      confidenceDistribution: response.confidence_distribution,
      recognizedText: `Predicted digit: ${response.predicted_digit}`,
    };
  };

  const handleRecognize = async ({ silent = false } = {}) => {
    if (!canvasRef.current) {
      return;
    }

    const canvasData = canvasRef.current.getCanvasData();
    if (!canvasData?.paths || canvasData.paths.length === 0) {
      hasInkRef.current = false;
      if (!silent) {
        Alert.alert(t('home.noticeTitle'), t('home.noticeWrite'));
      }
      return;
    }

    if (isRecognizing) {
      return;
    }

    setIsRecognizing(true);
    clearTimers();

    try {
      const normalizedPixels = canvasRef.current.getNormalizedPixels?.();
      const base64Image = await canvasRef.current.getBase64Image();
      if (!base64Image) {
        throw new Error('capture-failed');
      }

      const response = await springBootService.predictDigit(base64Image);
      if (!response.success) {
        throw new Error(response.error || 'Prediction failed');
      }

      const payload = buildResultPayload(response);
      const entry = {
        ...payload,
        timestamp: payload.timestamp,
        drawingPaths: canvasData.paths,
        canvasSize: canvasData.canvasSize,
        payloadType: 'base64',
        imageData: base64Image,
        previewData: base64Image,
        normalizedPixels,
      };
      setLatestResult(entry);

      // Save to history only if user is authenticated
      if (isAuthenticated) {
        await addEntry(entry);
      } else {
        // Store entry temporarily and show login prompt
        setPendingEntry(entry);
        setLoginPromptVisible(true);
      }

      hasInkRef.current = false;
    } catch (error) {
      if (!silent) {
        Alert.alert('Recognition failed', error.message || 'Unable to predict digit.');
      }
      console.error('Recognition error', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleViewDetails = () => {
    if (!latestResult) return;
    router.push({ pathname: '/result', params: { result: JSON.stringify(latestResult) } });
  };

  const handleLoginPromptLogin = () => {
    setLoginPromptVisible(false);
    // Navigate to signin, and pass the pending entry to be saved after login
    router.push({
      pathname: '/signin',
      params: {
        mode: 'login',
        returnTo: '/(tabs)',
        // We'll handle saving the entry after login in the signin flow
      },
    });
  };

  const handleLoginPromptContinue = () => {
    setLoginPromptVisible(false);
    // Clear the pending entry - history will not be saved
    setPendingEntry(null);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <LinearGradient colors={colors.heroGradient} style={styles.heroGradient}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIdentity}>
                <DigiScribeLogo size={64} />
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
                  <Text style={styles.heroSubtitle}>{t('home.heroDescription')}</Text>
                  <Text style={styles.heroMeta}>
                    {isAuthenticated ? `@${user?.username}` : t('home.guestMode')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setTipsVisible(true)}
              >
                <Ionicons name="information-circle" size={22} color={colors.textPrimary} />
                <Text style={styles.infoText}>{t('home.tipsButton')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <StackCard style={styles.canvasCard}>
          <View style={{ gap: 4 }}>
            <Text style={styles.sectionTitle}>{t('home.writeHere')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.hint')}</Text>
          </View>

      <HandwritingCanvas
        ref={canvasRef}
        onStrokeActivity={handleStrokeActivity}
        strokeColor={colors.textPrimary}
        backgroundColor={colors.surface}
        style={[styles.canvas, { borderColor: colors.border, backgroundColor: colors.surface }]}
      />

      <StackCard style={[styles.predictionCard, { marginTop: 12 }]} padding={18}>
        <View style={styles.predictionHeader}>
          <Text style={styles.sectionTitle}>{t('home.latestPrediction')}</Text>
          {latestResult ? (
            <TouchableOpacity onPress={handleViewDetails} style={styles.actionChip}>
              <Text style={styles.actionChipText}>{t('home.viewDetails')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {latestResult ? (
          <View style={styles.predictionContent}>
            <Text style={styles.predictionDigit}>{latestResult.digit}</Text>
            <View style={styles.predictionMeta}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {t('home.confidence')}: {latestResult.confidence}%
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {t('home.model')}: {latestResult.modelUsed}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {latestResult.processingTime || t('home.processing')}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.sectionSubtitle}>{t('home.latestEmpty')}</Text>
        )}
      </StackCard>

      <View style={styles.canvasActions}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
            >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>{t('home.clear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.recognizeButton, isRecognizing && { opacity: 0.6 }]}
            onPress={() => handleRecognize({ silent: false })}
            disabled={isRecognizing}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {isRecognizing ? t('home.processing') : t('home.recognize')}
            </Text>
          </TouchableOpacity>
      </View>

      <View style={styles.autoRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {autoRecognitionEnabled ? t('home.autoRecognition') : t('home.autoRecognitionPaused')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {t('home.autoRecognitionHint')}
            </Text>
        </View>
        <Switch
          value={autoRecognitionEnabled}
          onValueChange={(value) => {
            setAutoRecognitionEnabled(value);
            if (!value) {
              clearTimers();
            } else if (hasInkRef.current) {
              scheduleAutoRecognition();
            }
          }}
          trackColor={{ false: colors.border, true: colors.accentMuted }}
          thumbColor={isDark ? '#f8fafc' : '#fff'}
        />
      </View>
        </StackCard>
      </ScrollView>

      <Modal
        visible={tipsVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setTipsVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTipsVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('home.instructionsTitle')}</Text>
            <View style={styles.modalList}>
              {t('home.instructionSteps').map((tip, index) => (
                <Text key={tip} style={styles.modalItem}>
                  {index + 1}. {tip}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setTipsVisible(false)}>
              <Text style={styles.modalButtonText}>{t('home.tipsClose')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={loginPromptVisible}
        animationType="fade"
        transparent
        onRequestClose={handleLoginPromptContinue}
      >
        <Pressable style={styles.modalOverlay} onPress={handleLoginPromptContinue}>
          <Pressable style={styles.modalContent} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Save Your Recognition?</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
              Create an account to save your recognition history and access it across devices.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1, backgroundColor: colors.accent }]}
                onPress={handleLoginPromptLogin}
              >
                <Text style={styles.modalButtonText}>Login / Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleLoginPromptContinue}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
