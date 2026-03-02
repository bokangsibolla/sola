import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';

interface NoteBlockProps {
  block: ItineraryBlockWithTags;
  onPress?: () => void;
  onLongPress?: () => void;
}

// Simple URL regex — matches http(s):// URLs in text
const URL_REGEX = /https?:\/\/[^\s]+/gi;

/** Extract the domain from a URL string. */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Get a display-friendly icon name for common domains. */
function getDomainIcon(domain: string): string {
  if (domain.includes('booking.com')) return 'bed-outline';
  if (domain.includes('airbnb')) return 'home-outline';
  if (domain.includes('google.com/maps') || domain.includes('goo.gl')) return 'map-outline';
  if (domain.includes('tripadvisor')) return 'star-outline';
  if (domain.includes('instagram')) return 'camera-outline';
  return 'link-outline';
}

export const NoteBlock: React.FC<NoteBlockProps> = ({ block, onPress, onLongPress }) => {
  const noteText = block.titleOverride ?? '';
  const metaUrl = (block.meta?.url as string) ?? null;

  // Find URLs in the note text
  const urls = useMemo(() => {
    const found: string[] = [];
    if (metaUrl) found.push(metaUrl);
    const matches = noteText.match(URL_REGEX);
    if (matches) {
      for (const m of matches) {
        if (!found.includes(m)) found.push(m);
      }
    }
    return found;
  }, [noteText, metaUrl]);

  const hasLinks = urls.length > 0;
  const firstUrl = urls[0] ?? null;
  const domain = firstUrl ? extractDomain(firstUrl) : null;

  // Clean text: remove URLs for display if we're showing a link preview
  const displayText = hasLinks
    ? noteText.replace(URL_REGEX, '').trim()
    : noteText;

  const handleLinkPress = () => {
    if (firstUrl) Linking.openURL(firstUrl);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Note icon + text */}
        <View style={styles.headerRow}>
          <Ionicons name="document-text-outline" size={16} color={colors.orange} />
          <Text style={styles.noteLabel}>Note</Text>
        </View>

        {/* Note text */}
        {displayText.length > 0 && (
          <Text style={styles.noteText}>{displayText}</Text>
        )}

        {/* Link preview */}
        {hasLinks && firstUrl && domain && (
          <Pressable
            onPress={handleLinkPress}
            style={({ pressed }) => [
              styles.linkPreview,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.linkIconWrap}>
              <Ionicons
                name={getDomainIcon(domain) as any}
                size={18}
                color={colors.orange}
              />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkDomain} numberOfLines={1}>{domain}</Text>
              <Text style={styles.linkUrl} numberOfLines={1}>{firstUrl}</Text>
            </View>
            <Ionicons name="open-outline" size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  noteLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.sm,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkDomain: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  linkUrl: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});
