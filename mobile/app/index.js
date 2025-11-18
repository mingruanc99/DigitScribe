import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useSettings } from '../src/context/SettingsContext';
import DigiScribeLogo from './components/DigiScribeLogo';

export default function Landing() {
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();
  const { colors, t, isDark } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, [fadeAnim, slideAnim, pulseAnim]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePrimary = () => {
    if (isAuthenticated) {
      router.push('/(tabs)');
    } else {
      router.push({ pathname: '/signin', params: { mode: 'login' } });
    }
  };

  const handleSecondary = () => {
    router.push({ pathname: '/signin', params: { mode: 'register' } });
  };

  const handleGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
        <LinearGradient colors={colors.heroGradient} style={styles.heroGradient}>
          <View style={styles.heroIdentity}>
            <View style={styles.logoBadge}>
              <DigiScribeLogo size={80} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('landing.title')}</Text>
              <Text style={styles.tagline}>{t('landing.subtitle')}</Text>
            </View>
          </View>
          <View style={styles.heroChipRow}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>AI · CNN</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>DigiScribe</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.featuresCard}>
        {t('landing.features').map((feature) => (
          <View key={feature.title} style={styles.featureRow}>
            <View style={styles.featureDot} />
            <View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePrimary} disabled={initializing}>
            <Text style={styles.primaryText}>{t('landing.ctaPrimary')}</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSecondary}>
          <Text style={styles.secondaryText}>{t('landing.ctaSecondary')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostButton} onPress={handleGuest}>
          <Text style={styles.ghostText}>{t('landing.guest')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      gap: 20,
      justifyContent: 'center',
    },
    heroCard: {
      borderRadius: 32,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 6,
    },
    heroGradient: {
      padding: 32,
      gap: 20,
    },
    heroIdentity: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    logoBadge: {
      padding: 12,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    tagline: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    heroChipRow: {
      flexDirection: 'row',
      gap: 12,
    },
    heroChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    heroChipText: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 12,
    },
    featuresCard: {
      borderRadius: 28,
      padding: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    featureRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    featureDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
      marginTop: 6,
    },
    featureTitle: {
      fontWeight: '600',
      color: colors.textPrimary,
    },
    featureSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    actions: {
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      padding: 18,
      borderRadius: 24,
      alignItems: 'center',
    },
    primaryText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    secondaryButton: {
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    secondaryText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    ghostButton: {
      padding: 12,
      alignItems: 'center',
    },
    ghostText: {
      color: colors.textSecondary,
    },
  });
