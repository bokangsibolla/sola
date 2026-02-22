import { useState, ReactNode } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/design';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  title: string;
  icon: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, icon, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggle} style={styles.header}>
        <Ionicons name={icon as any} size={20} color={colors.orange} />
        <SolaText variant="label" style={styles.title}>{title}</SolaText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  title: { flex: 1 },
  body: { paddingBottom: spacing.xl },
});
