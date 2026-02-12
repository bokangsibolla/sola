import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface CollectionItem {
  id: string;
  name: string;
  emoji: string;
}

interface CollectionPickerSheetProps {
  visible: boolean;
  collections: CollectionItem[];
  onSelect: (collectionId: string) => void;
  onCreate: (name: string, emoji?: string) => void;
  onClose: () => void;
}

export default function CollectionPickerSheet({
  visible,
  collections,
  onSelect,
  onCreate,
  onClose,
}: CollectionPickerSheetProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim().length === 0) return;
    onCreate(newName.trim());
    setNewName('');
    setIsCreating(false);
  };

  const handleClose = () => {
    setIsCreating(false);
    setNewName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View />
      </Pressable>

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Title */}
        <Text style={styles.title}>Add to Collection</Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {/* New Collection row */}
          {!isCreating ? (
            <Pressable
              onPress={() => setIsCreating(true)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <Feather name="plus" size={18} color={colors.orange} />
              </View>
              <Text style={styles.newCollectionText}>New Collection</Text>
            </Pressable>
          ) : (
            <View style={styles.createRow}>
              <TextInput
                style={styles.input}
                placeholder="Collection name"
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
                maxLength={40}
              />
              <Pressable
                onPress={handleCreate}
                style={[
                  styles.createButton,
                  newName.trim().length === 0 && styles.createButtonDisabled,
                ]}
                disabled={newName.trim().length === 0}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </Pressable>
            </View>
          )}

          {/* Existing collections */}
          {collections.map((collection) => (
            <Pressable
              key={collection.id}
              onPress={() => onSelect(collection.id)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{collection.emoji}</Text>
              </View>
              <Text style={styles.collectionName}>{collection.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '60%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutralFill,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowPressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 18,
  },
  newCollectionText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.orange,
  },
  collectionName: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },
});
