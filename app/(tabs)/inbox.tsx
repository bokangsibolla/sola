import { StyleSheet, View, ScrollView } from 'react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { Body, Title } from '@/components/ui/SolaText';
import { colors, spacing, typography } from '@/constants/design';

export default function InboxScreen() {
  return (
    <AppScreen>
      <AppHeader 
        title="Inbox" 
        subtitle="Travel connections and updates." 
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body style={styles.explanation}>
          When you start planning trips, you'll see matching travelers and updates here.
        </Body>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Requests</Title>
          <Body style={styles.emptyState}>No requests yet.</Body>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Messages</Title>
          <Body style={styles.emptyState}>No messages yet.</Body>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  explanation: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  emptyState: {
    color: colors.textSecondary,
  },
});
