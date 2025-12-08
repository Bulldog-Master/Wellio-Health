export interface IntervalTimerData {
  id: string;
  name: string;
  user_id: string;
  intervals: TimerInterval[];
  repeat_count?: number;
  folder_id?: string | null;
  created_at?: string;
  text_to_speech?: boolean;
  countdown_beeps?: boolean;
  use_for_notifications?: boolean;
  use_interim_interval?: boolean;
  interim_interval_seconds?: number;
  end_with_interim?: boolean;
  show_line_numbers?: boolean;
  show_elapsed_time?: boolean;
  include_reps?: boolean;
  include_sets?: boolean;
}

export interface TimerInterval {
  id: string;
  name: string;
  duration: number;
  color: string;
  sound?: string;
  reps?: number;
  repBased?: boolean;
}

export interface TimerFolder {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

export interface TimerSettings {
  intervalCompleteSound: string;
  timerCompleteSound: string;
  timerCompleteRepeat: boolean;
  doubleBeepSound: string;
  textToSpeech: boolean;
  includeSets: boolean;
  includeReps: boolean;
  useForNotifications: boolean;
  countdownBeeps: boolean;
  useInterimInterval: boolean;
  interimIntervalSeconds: number;
  interimRepetitions: number;
  interimSets: number;
  interimColor: string;
  interimSound: string;
  endWithInterval: boolean;
  showLineNumbers: boolean;
  showElapsedTime: boolean;
  isRepBased: boolean;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  intervalCompleteSound: "beep",
  timerCompleteSound: "beep",
  timerCompleteRepeat: false,
  doubleBeepSound: "doublebeep",
  textToSpeech: false,
  includeSets: false,
  includeReps: false,
  useForNotifications: false,
  countdownBeeps: false,
  useInterimInterval: false,
  interimIntervalSeconds: 10,
  interimRepetitions: 1,
  interimSets: 1,
  interimColor: "none",
  interimSound: "beep",
  endWithInterval: false,
  showLineNumbers: false,
  showElapsedTime: false,
  isRepBased: false,
};

export const SOUND_OPTIONS = [
  { id: 'none', name: 'No sound' },
  { id: 'beep', name: 'Beep' },
  { id: 'doublebeep', name: 'Double beep' },
  { id: 'triplet', name: 'Triplet' },
  { id: 'om', name: 'Om' },
  { id: 'alert', name: 'Alert' },
  { id: 'pipes', name: 'Pipes' },
  { id: 'pluck', name: 'Pluck' },
  { id: 'flourish', name: 'Flourish' },
  { id: 'sonar', name: 'Sonar' },
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'gong', name: 'Gong' },
  { id: 'singingbowl', name: 'Singing bowl' },
  { id: 'meditationbowl', name: 'Meditation bowl' },
  { id: 'meditationtriplet', name: 'Meditation triplet' },
];

export const COLOR_OPTIONS = [
  { id: 'none', name: 'None', hex: null },
  { id: 'red', name: 'Red', hex: '#ef4444' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'purple', name: 'Purple', hex: '#a855f7' },
  { id: 'brown', name: 'Brown', hex: '#92400e' },
];
