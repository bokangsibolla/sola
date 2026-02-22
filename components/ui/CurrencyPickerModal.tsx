import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { getSupportedCurrencies } from '@/lib/currency';

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelect: (currencyCode: string) => void;
}

export function CurrencyPickerModal({
  visible,
  onClose,
  currentCurrency,
  onSelect,
}: CurrencyPickerModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const currencies = useMemo(() => getSupportedCurrencies(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return currencies;
    const q = search.toLowerCase();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.symbol.includes(q),
    );
  }, [currencies, search]);

  const handleSelect = (code: string) => {
    onSelect(code);
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <SolaText style={styles.title}>{t('currency.selectCurrency')}</SolaText>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('currency.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = item.code === currentCurrency;
              return (
                <Pressable
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => handleSelect(item.code)}
                >
                  <SolaText style={styles.symbol}>{item.symbol}</SolaText>
                  <View style={styles.labelContainer}>
                    <SolaText style={[styles.code, isSelected && styles.codeSelected]}>
                      {item.code}
                    </SolaText>
                    <SolaText style={styles.label}>{item.label}</SolaText>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.orange} />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <SolaText style={styles.empty}>{t('currency.noCurrenciesFound')}</SolaText>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '75%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  rowSelected: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    borderBottomColor: 'transparent',
  },
  symbol: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    width: 28,
    textAlign: 'center',
  },
  labelContainer: {
    flex: 1,
    gap: 2,
  },
  code: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  codeSelected: {
    color: colors.orange,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
