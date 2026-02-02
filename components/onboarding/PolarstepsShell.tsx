import React from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from './AnimatedBackground';

interface PolarstepsShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  backgroundImage?: any; // Require path for blurred map background
  animatedImages?: any[]; // Array of images for animated background
  blurAmount?: number; // Optional blur amount, default lighter
  showOrangeGradient?: boolean; // Show orange gradient in bottom half
}

export default function PolarstepsShell({ 
  children, 
  footer, 
  scrollable = false,
  backgroundImage,
  animatedImages,
  blurAmount = 0, // No blur - use overlay instead
  showOrangeGradient = false
}: PolarstepsShellProps) {
  const insets = useSafeAreaInsets();

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: styles.scrollContent,
  } : { style: styles.content };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {animatedImages && animatedImages.length > 0 ? (
        <AnimatedBackground images={animatedImages} delay={2500} />
      ) : backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={blurAmount}
        >
          <View style={styles.overlay} />
        </ImageBackground>
      ) : null}
      {showOrangeGradient && (
        <ImageBackground
          source={require('@/assets/images/orange-gradient.png')}
          style={styles.orangeGradient}
          resizeMode="cover"
        />
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ContentWrapper {...contentProps}>
          {children}
        </ContentWrapper>

        {footer && (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark background like Polarsteps
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)', // Subtle dark overlay - keep image crisp
  },
  orangeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Bottom half only
    width: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
