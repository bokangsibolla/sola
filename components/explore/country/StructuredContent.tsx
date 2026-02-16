import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentBlock {
  type: 'paragraph' | 'bullet';
  text: string;
}

interface Props {
  markdown: string;
  /** Max number of blocks to show (bullets + paragraphs). Default: 6 */
  maxItems?: number;
}

// ---------------------------------------------------------------------------
// Parser — keeps bullet structure, strips headings
// ---------------------------------------------------------------------------

function parseMarkdown(md: string, max: number): ContentBlock[] {
  // Strip headings
  const stripped = md.replace(/^#+\s.*/gm, '').trim();

  const lines = stripped.split('\n');
  const blocks: ContentBlock[] = [];
  let currentParagraph = '';

  const flush = () => {
    if (currentParagraph.trim()) {
      blocks.push({ type: 'paragraph', text: currentParagraph.trim() });
      currentParagraph = '';
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flush();
      continue;
    }

    // Bullet line
    if (/^[-*]\s+/.test(trimmed)) {
      flush();
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      blocks.push({ type: 'bullet', text: bulletText });
    } else {
      // Regular text — append to current paragraph
      currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
    }
  }

  flush();

  return blocks.slice(0, max);
}

// ---------------------------------------------------------------------------
// Renderer — handles **bold** within text
// ---------------------------------------------------------------------------

function renderTextWithBold(text: string, baseStyle: any) {
  // Strip bold markers but keep them as separate styled segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  if (parts.length === 1) {
    return <Text style={baseStyle}>{text.replace(/\*\*/g, '')}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StructuredContent({ markdown, maxItems = 6 }: Props) {
  const blocks = parseMarkdown(markdown, maxItems);

  if (blocks.length === 0) return null;

  return (
    <View>
      {blocks.map((block, i) => {
        if (block.type === 'bullet') {
          return (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>{'\u2022'}</Text>
              <View style={styles.bulletContent}>
                {renderTextWithBold(block.text, styles.bulletText)}
              </View>
            </View>
          );
        }

        return (
          <View key={i} style={styles.paragraphBlock}>
            {renderTextWithBold(block.text, styles.paragraphText)}
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  paragraphBlock: {
    marginBottom: spacing.md,
  },
  paragraphText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingRight: spacing.sm,
  },
  bulletDot: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    width: 16,
  },
  bulletContent: {
    flex: 1,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bold: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
});
