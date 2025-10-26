export enum AppState {
  Idle = 'idle',
  Processing = 'processing',
  Done = 'done',
  Error = 'error',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DreamData {
  transcription: string;
  imageUrl: string;
  interpretation: string;
}