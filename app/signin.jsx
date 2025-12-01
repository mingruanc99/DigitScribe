import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import DigiScribeLogo from '../components/DigiScribeLogo';
import StackCard from '../components/StackCard';

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      gap: 20,
    },
    heroCard: {
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    toggle: {
      flexDirection: 'row',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    toggleButton: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
    },
    toggleActive: {
      backgroundColor: colors.accent,
    },
    toggleText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    toggleTextActive: {
      color: '#fff',
    },
    inputCard: {
      gap: 16,
    },
    inputLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.elevated,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
    },
    primaryText: {
      color: '#fff',
      fontWeight: '700',
    },
    ghostButton: {
      alignItems: 'center',
      padding: 12,
    },
    ghostText: {
      color: colors.textSecondary,
    },
  });

export default function SignIn() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, register } = useAuth();
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [mode, setMode] = useState(params?.mode === 'register' ? 'register' : 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params?.mode) {
      setMode(params.mode === 'register' ? 'register' : 'login');
    }
  }, [params?.mode]);

  const handleAuth = async () => {
    if (!username.trim()) {
      Alert.alert(t('auth.missingUsername'));
      return;
    }
    if (!password.trim()) {
      Alert.alert(t('auth.missingPassword'));
      return;
    }
    if (mode === 'register' && !email.trim()) {
      Alert.alert(t('auth.missingEmail'));
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ username, password });
      } else {
        await register({ username, email, password });
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('auth.errorTitle'), error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StackCard style={styles.heroCard}>
        <DigiScribeLogo size={72} />
        <Text style={styles.title}>{t('auth.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
      </StackCard>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'login' && styles.toggleActive]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>{t('auth.login')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'register' && styles.toggleActive]}
          onPress={() => setMode('register')}
        >
          <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>{t('auth.register')}</Text>
        </TouchableOpacity>
      </View>

      <StackCard style={styles.inputCard}>
        <View>
          <Text style={styles.inputLabel}>{t('auth.username')}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {mode === 'register' ? (
          <View>
            <Text style={styles.inputLabel}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        ) : null}

        <View>
          <Text style={styles.inputLabel}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAuth}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{t('auth.submit')}</Text>}
        </TouchableOpacity>
      </StackCard>

      <TouchableOpacity style={styles.ghostButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.ghostText}>{t('auth.guest')}</Text>
      </TouchableOpacity>
    </View>
  );
}
