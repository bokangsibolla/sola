/**
 * Centralized analytics event constants for Sola
 * Use with usePostHog() hook: posthog.capture(AnalyticsEvents.EVENT_NAME)
 *
 * Rules:
 * - Every event must be in this file (no string literals in components)
 * - snake_case event names
 * - Properties: always include relevant IDs, never include PII
 */

// Event names as constants for type safety and consistency
export const AnalyticsEvents = {
  // Screen views
  SCREEN_VIEWED: 'screen_viewed',

  // Auth & Onboarding
  WELCOME_SCREEN_VIEWED: 'welcome_screen_viewed',
  CREATE_ACCOUNT_TAPPED: 'create_account_tapped',
  LOGIN_TAPPED: 'login_tapped',
  GOOGLE_AUTH_TAPPED: 'google_auth_tapped',
  APPLE_AUTH_TAPPED: 'apple_auth_tapped',
  EMAIL_AUTH_ATTEMPTED: 'email_auth_attempted',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  LOGOUT: 'logout',

  // Onboarding flow
  ONBOARDING_FLOW_STARTED: 'onboarding_flow_started',
  ONBOARDING_SCREEN_VIEWED: 'onboarding_screen_viewed',
  ONBOARDING_SCREEN_COMPLETED: 'onboarding_screen_completed',
  ONBOARDING_SCREEN_SKIPPED: 'onboarding_screen_skipped',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PROFILE_PHOTO_ADDED: 'profile_photo_added',
  COUNTRY_SELECTED: 'country_selected',
  INTENT_SELECTED: 'intent_selected',
  INTERESTS_SELECTED: 'interests_selected',

  // Home & Discovery
  HOME_SCREEN_VIEWED: 'home_screen_viewed',
  TRAVELER_CARD_VIEWED: 'traveler_card_viewed',
  TRAVELER_PROFILE_TAPPED: 'traveler_profile_tapped',
  USER_PROFILE_VIEWED: 'user_profile_viewed',
  CONNECTION_REQUEST_SENT: 'connection_request_sent',
  LOCATION_ENABLED: 'location_enabled',

  // Messaging
  INBOX_OPENED: 'inbox_opened',
  CONVERSATION_OPENED: 'conversation_opened',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_CONVERSATION_STARTED: 'message_conversation_started',

  // Explore
  EXPLORE_SCREEN_VIEWED: 'explore_screen_viewed',
  EXPLORE_TAB_SWITCHED: 'explore_tab_switched',
  EXPLORE_SEARCH_USED: 'explore_search_used',
  COUNTRY_GUIDE_VIEWED: 'country_guide_viewed',
  COUNTRY_SECTION_EXPANDED: 'country_section_expanded',
  CITY_TAPPED: 'city_tapped',
  CITY_PLACES_VIEWED: 'city_places_viewed',
  PLACE_LIST_VIEWED: 'place_list_viewed',
  PLACE_DETAIL_VIEWED: 'place_detail_viewed',
  PLACE_SAVED: 'place_saved',
  PLACE_UNSAVED: 'place_unsaved',
  PLACE_MAPS_OPENED: 'place_maps_opened',
  SEARCH_RESULT_SELECTED: 'search_result_selected',

  // Discovery Lenses
  LENS_VIEWED: 'lens_viewed',
  LENS_RESULT_TAPPED: 'lens_result_tapped',

  // Profile
  PROFILE_SCREEN_VIEWED: 'profile_screen_viewed',
  PROFILE_EDIT_OPENED: 'profile_edit_opened',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_OPENED: 'settings_opened',
  PRIVACY_SETTING_CHANGED: 'privacy_setting_changed',
  COLLECTION_VIEWED: 'collection_viewed',
  COLLECTION_TAPPED: 'collection_tapped',
  EDIT_PROFILE_TAPPED: 'edit_profile_tapped',

  // Trips
  TRIPS_SCREEN_VIEWED: 'trips_screen_viewed',
  TRIP_CREATED: 'trip_created',
  TRIP_DETAIL_VIEWED: 'trip_detail_viewed',
  TRIP_PLACE_ADDED: 'trip_place_added',
  ADD_TRIP_TAPPED: 'add_trip_tapped',

  // Community
  COMMUNITY_SCREEN_VIEWED: 'community_screen_viewed',
  COMMUNITY_THREAD_VIEWED: 'community_thread_viewed',
  COMMUNITY_POST_CREATED: 'community_post_created',
  COMMUNITY_REPLY_CREATED: 'community_reply_created',
  COMMUNITY_VOTE_CAST: 'community_vote_cast',

  // Monetization / Outbound Links
  AFFILIATE_LINK_TAPPED: 'affiliate_link_tapped',
  BOOKING_LINK_TAPPED: 'booking_link_tapped',
  WEBSITE_LINK_TAPPED: 'website_link_tapped',

  // Trust & Safety
  USER_REPORTED: 'user_reported',
  USER_BLOCKED: 'user_blocked',
  CONTENT_REPORTED: 'content_reported',
  VERIFICATION_STARTED: 'verification_started',
  VERIFICATION_SUBMITTED: 'verification_submitted',

  // SOS
  SOS_SCREEN_VIEWED: 'sos_screen_viewed',

  // Account
  ACCOUNT_DELETION_STARTED: 'account_deletion_started',
  ACCOUNT_DELETION_COMPLETED: 'account_deletion_completed',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
