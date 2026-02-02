import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import TravelerCard from '@/components/TravelerCard';
import { mockUsers } from '@/data/mock';
import { colors, fonts, spacing, typography } from '@/constants/design';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Travelers near you</Text>
        <Text style={styles.subtitle}>
          Women exploring the world right now
        </Text>

        <View style={styles.feed}>
          {mockUsers.map((user) => (
            <TravelerCard
              key={user.id}
              user={user}
              onPress={() => router.push(`/home/user/${user.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 22,
    width: 60,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  feed: {
    gap: 0,
  },
});
