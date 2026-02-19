export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface SpeakerNotes {
  memberId: string;
  wins: string[];
  focus: string[];
  blockers: string[];
  decisions: string[];
  links: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  ownerId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  standupId: string;
  notes?: string;
}

export interface Standup {
  id: string;
  date: string;
  speakers: SpeakerNotes[];
  actionItems: string[]; // references to ActionItem ids
  isComplete: boolean;
}

export type ViewMode = 'standup' | 'summary' | 'history' | 'tracker';

// Web Speech API types (not in standard TS lib)
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
