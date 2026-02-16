export type EventType =
  | 'viewed_country'
  | 'viewed_city'
  | 'viewed_place'
  | 'saved_place'
  | 'unsaved_place'
  | 'opened_collection'
  | 'searched'
  | 'opened_thread'
  | 'replied_thread'
  | 'created_trip'
  | 'added_place_to_trip'
  | 'viewed_traveler';

export type EntityType =
  | 'country'
  | 'city'
  | 'place'
  | 'collection'
  | 'thread'
  | 'trip'
  | 'profile';

export interface UserEvent {
  user_id: string;
  event_type: EventType;
  entity_type: EntityType | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
