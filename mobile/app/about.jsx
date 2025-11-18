import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSettings } from '../src/context/SettingsContext';
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  memberCard: {
    marginBottom: 12,
  },
  memberEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  memberDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default function AboutTeam() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const members = t('about.teamMembers');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('about.title')}</Text>
        <Text style={styles.subtitle}>{t('about.subtitle')}</Text>
      </View>

      <View style={styles.content}>
        <StackCard style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>{t('about.missionTitle')}</Text>
          <Text style={styles.description}>{t('about.missionBody')}</Text>
        </StackCard>

        <Text style={styles.sectionTitle}>{t('about.teamTitle')}</Text>
        {members.map((member) => (
          <StackCard key={member.name} style={styles.memberCard}>
            <Text style={styles.memberEmoji}>{member.emoji}</Text>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            <Text style={styles.memberDescription}>{member.description}</Text>
          </StackCard>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('about.version', { version: '1.0.0' })}</Text>
          <Text style={styles.footerSubtext}>{t('about.builtWith')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
