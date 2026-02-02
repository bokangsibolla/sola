import { StyleSheet, View, ScrollView, Text, Pressable, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import ImageCard from '@/components/ui/ImageCard';
import { placeholder } from '@/data/placeholder';
import { colors, spacing, typography, radius } from '@/constants/design';

export default function ExploreScreen() {
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
        rightComponent={
          <View style={styles.avatarButton}>
            <View style={styles.avatar} />
          </View>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations, stays, and things to do"
            placeholderTextColor={colors.textSecondary}
            editable={false}
          />
        </View>

        <Pressable 
          style={styles.pillButton}
          onPress={() => console.log('Explore destinations')}
        >
          <Text style={styles.pillButtonText}>Explore destinations</Text>
        </Pressable>

        <Text style={styles.sectionHeader}>Featured destinations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {placeholder.explore.featuredCountries.map((country) => (
            <View key={country.id} style={styles.cardWrapper}>
              <ImageCard
                title={country.name}
                imageUrl={country.heroImageUrl}
                onPress={() => console.log('country:', country.slug)}
              />
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  pillButton: {
    backgroundColor: colors.orange,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  pillButtonText: {
    ...typography.body,
    fontSize: 14,
    color: colors.background,
    fontWeight: '600',
  },
  sectionHeader: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  scrollView: {
    marginHorizontal: -spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  cardWrapper: {
    width: 280,
    marginLeft: spacing.lg,
  },
  avatarButton: {
    padding: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderSubtle,
  },
  logo: {
    height: 22,
    width: 'auto',
  },
});
