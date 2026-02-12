/**
 * useSaveFlow — Instagram-style save + collection flow.
 *
 * Usage:
 *   const save = useSaveFlow();
 *   <SaveBookmarkIcon isSaved={save.isPlaceSaved(id)} onPress={() => save.toggle(id)} />
 *   <SaveToast visible={save.toastVisible} onAddToCollection={save.openPicker} onDismiss={save.hideToast} />
 *   <CollectionPickerSheet visible={save.pickerVisible} ... />
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/state/AuthContext';
import {
  toggleSavePlace,
  getCollections,
  createCollection,
  addPlaceToCollection,
} from '@/data/api';
import type { Collection } from '@/data/types';

interface SaveFlowState {
  // Toast
  toastVisible: boolean;
  toastMessage: string;
  // Picker
  pickerVisible: boolean;
  // Current place being saved
  activePlaceId: string | null;
  // Local saved set for instant UI feedback
  savedPlaceIds: Set<string>;
  // Collections
  collections: Collection[];
}

export function useSaveFlow(initialSavedIds: string[] = []) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const [state, setState] = useState<SaveFlowState>({
    toastVisible: false,
    toastMessage: 'Saved',
    pickerVisible: false,
    activePlaceId: null,
    savedPlaceIds: new Set(initialSavedIds),
    collections: [],
  });

  const isPlaceSaved = useCallback(
    (placeId: string) => state.savedPlaceIds.has(placeId),
    [state.savedPlaceIds],
  );

  const toggle = useCallback(
    async (placeId: string) => {
      if (!userId) return;

      const wasSaved = state.savedPlaceIds.has(placeId);

      // Optimistic update
      setState((prev) => {
        const next = new Set(prev.savedPlaceIds);
        if (wasSaved) {
          next.delete(placeId);
        } else {
          next.add(placeId);
        }
        return {
          ...prev,
          savedPlaceIds: next,
          activePlaceId: wasSaved ? null : placeId,
          toastVisible: !wasSaved,
          toastMessage: wasSaved ? '' : 'Saved',
        };
      });

      try {
        await toggleSavePlace(userId, placeId);
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['home-saved-places'] });
        queryClient.invalidateQueries({ queryKey: ['home-collections'] });
      } catch {
        // Revert optimistic update
        setState((prev) => {
          const reverted = new Set(prev.savedPlaceIds);
          if (wasSaved) {
            reverted.add(placeId);
          } else {
            reverted.delete(placeId);
          }
          return { ...prev, savedPlaceIds: reverted, toastVisible: false };
        });
      }
    },
    [userId, state.savedPlaceIds, queryClient],
  );

  const hideToast = useCallback(() => {
    setState((prev) => ({ ...prev, toastVisible: false, activePlaceId: null }));
  }, []);

  const openPicker = useCallback(async () => {
    if (!userId) return;
    // Fetch fresh collections
    try {
      const collections = await getCollections(userId);
      setState((prev) => ({
        ...prev,
        toastVisible: false,
        pickerVisible: true,
        collections,
      }));
    } catch {
      // Show picker with whatever we have
      setState((prev) => ({ ...prev, toastVisible: false, pickerVisible: true }));
    }
  }, [userId]);

  const closePicker = useCallback(() => {
    setState((prev) => ({ ...prev, pickerVisible: false, activePlaceId: null }));
  }, []);

  const selectCollection = useCallback(
    async (collectionId: string) => {
      if (!userId || !state.activePlaceId) return;

      try {
        await addPlaceToCollection(userId, state.activePlaceId, collectionId);
        const collection = state.collections.find((c) => c.id === collectionId);
        setState((prev) => ({
          ...prev,
          pickerVisible: false,
          toastVisible: true,
          toastMessage: `Added to ${collection?.name ?? 'collection'}`,
        }));
        queryClient.invalidateQueries({ queryKey: ['home-collections'] });
      } catch {
        setState((prev) => ({ ...prev, pickerVisible: false }));
      }
    },
    [userId, state.activePlaceId, state.collections, queryClient],
  );

  const handleCreateCollection = useCallback(
    async (name: string, emoji?: string) => {
      if (!userId || !state.activePlaceId) return;

      try {
        const collection = await createCollection(userId, { name, emoji });
        await addPlaceToCollection(userId, state.activePlaceId, collection.id);
        setState((prev) => ({
          ...prev,
          pickerVisible: false,
          toastVisible: true,
          toastMessage: `Added to ${name}`,
        }));
        queryClient.invalidateQueries({ queryKey: ['home-collections'] });
      } catch {
        setState((prev) => ({ ...prev, pickerVisible: false }));
      }
    },
    [userId, state.activePlaceId, queryClient],
  );

  return {
    // State
    isPlaceSaved,
    toastVisible: state.toastVisible,
    toastMessage: state.toastMessage,
    pickerVisible: state.pickerVisible,
    collections: state.collections,

    // Actions
    toggle,
    hideToast,
    openPicker,
    closePicker,
    selectCollection,
    createCollection: handleCreateCollection,
  };
}
