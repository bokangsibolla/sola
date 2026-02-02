import CheckboxRow from '@/components/onboarding/CheckboxRow';
import { Body } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [womenConfirmed, setWomenConfirmed] = useState(false);

  const canProceed = termsAgreed && privacyAgreed && womenConfirmed;

  const handleSignUp = () => {
    if (!canProceed) return;
    router.push('/(auth)/creating-account');
  };

  const handleLogIn = () => {
    if (!canProceed) return;
    // TODO: Implement actual login flow
    router.push('/(auth)/create-account');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo - Quiet signature, anchored at top */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main message - Centered, generous spacing */}
        <View style={styles.messageContainer}>
          <Body style={styles.headline}>Because women travel differently</Body>
          <Body style={styles.subheadline}>The trusted app for women who travel solo</Body>
        </View>

        {/* Legal confirmations - Grouped, less heavy */}
        <View style={styles.legalContainer}>
          <View style={styles.legalGroup}>
            <CheckboxRow
              label={
                <>
                  I agree to the <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                </>
              }
              checked={termsAgreed && privacyAgreed}
              onToggle={() => {
                const newValue = !(termsAgreed && privacyAgreed);
                setTermsAgreed(newValue);
                setPrivacyAgreed(newValue);
              }}
            />
            
            <CheckboxRow
              label="I confirm I'm a woman"
              checked={womenConfirmed}
              onToggle={() => setWomenConfirmed(!womenConfirmed)}
            />
          </View>
        </View>

        {/* Actions - Clear hierarchy, generous bottom spacing */}
        <View style={[styles.actionsContainer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton, 
              !canProceed && styles.buttonDisabled,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleSignUp}
            disabled={!canProceed}
          >
            <Body style={[styles.primaryButtonText, !canProceed && styles.buttonTextDisabled]}>
              Sign up
            </Body>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.secondaryButton, 
              !canProceed && styles.buttonDisabled,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleLogIn}
            disabled={!canProceed}
          >
            <Body style={[styles.secondaryButtonText, !canProceed && styles.buttonTextDisabled]}>
              Log in
            </Body>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenX,
  },
  // Logo - Quiet signature, smaller, anchored
  logoContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    opacity: 0.9, // Subtle, not loud
  },
  // Message - Generous spacing, clear hierarchy
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 64, // Generous space before legal
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.2, // Tighter, more refined
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    textAlign: 'center',
    maxWidth: 280, // Constrain width for readability
  },
  // Legal - Grouped, less visual weight
  legalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  legalGroup: {
    gap: 16, // Tighter grouping
  },
  linkText: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
  // Actions - Clear hierarchy, premium feel
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...theme.shadow,
  },
  primaryButtonText: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.35,
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSubtle,
  },
  buttonTextDisabled: {
    color: theme.colors.muted,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
