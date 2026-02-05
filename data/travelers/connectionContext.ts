import type { Profile } from '@/data/types';

/**
 * Generate a human-readable context string for why two travelers might connect.
 * Used in connection requests and suggestion cards.
 */
export function getConnectionContext(
  currentUser: Profile,
  otherUser: Profile,
): string | undefined {
  // Same city
  if (
    currentUser.locationCityName &&
    otherUser.locationCityName &&
    currentUser.locationCityName === otherUser.locationCityName
  ) {
    return `You're both in ${currentUser.locationCityName}`;
  }

  // Same country
  if (
    currentUser.locationCountryName &&
    otherUser.locationCountryName &&
    currentUser.locationCountryName === otherUser.locationCountryName
  ) {
    return `You're both in ${currentUser.locationCountryName}`;
  }

  // Shared interests
  const shared = (currentUser.interests ?? []).filter((i) =>
    (otherUser.interests ?? []).includes(i),
  );
  if (shared.length > 0) {
    return shared.length === 1
      ? `You both enjoy ${shared[0]}`
      : `You both enjoy ${shared[0]} and ${shared[1]}`;
  }

  return undefined;
}

/**
 * Find interests shared between two profiles.
 */
export function getSharedInterests(
  currentUser: Profile,
  otherUser: Profile,
): string[] {
  return (currentUser.interests ?? []).filter((i) => (otherUser.interests ?? []).includes(i));
}
