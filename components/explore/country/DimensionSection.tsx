import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PlaceWithCity } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';
import { extractLeadSentence } from './mappings';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  markdown: string | null;
  places?: PlaceWithCity[];
  placesLabel?: string;
}

function cleanMarkdown(md: string): string {
  return md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitIntoParagraphs(md: string): string[] {
  const cleaned = cleanMarkdown(md);
  return cleaned
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0);
}

export function DimensionSection({ icon, title, markdown, places, placesLabel }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!markdown) return null;

  const lead = extractLeadSentence(markdown);
  const paragraphs = splitIntoParagraphs(markdown);
  const hasMore = paragraphs.length > 1 || (paragraphs[0]?.length ?? 0) > lead.length + 20;
  const hasPlaces = places && places.length > 0;

  return (
    <View style={styles.container}>
      {/* Section header with icon */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color={colors.orange} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Lead sentence, always visible */}
      <Text style={styles.lead}>{lead}</Text>

      {/* Expanded full content */}
      {expanded && (
        <View style={styles.expandedBody}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
        </View>
      )}

      {/* Read more / less toggle */}
      {hasMore && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          hitSlop={8}
          style={styles.toggleRow}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.orange}
          />
        </Pressable>
      )}

      {/* Place cards (visual content first) */}
      {hasPlaces && (
        <View style={styles.placesContainer}>
          {placesLabel && (
            <Text style={styles.placesLabel}>{placesLabel}</Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {places!.map((place) => (
              <PlaceHorizontalCard key={place.id} place={place} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 24,
    flex: 1,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  expandedBody: {
    marginTop: spacing.lg,
  },
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  toggleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  placesContainer: {
    marginTop: spacing.lg,
    marginHorizontal: -spacing.screenX,
    paddingLeft: spacing.screenX,
  },
  placesLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    paddingRight: spacing.screenX,
  },
});
