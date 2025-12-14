export interface Prize {
  id: string;
  name: string;
  weight: number;
  color: string;
}

export interface WheelScenario {
  id: string;
  name: string;
  prizes: Prize[];
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  prizeName: string;
  timestamp: number;
}

// Ensure global type for canvas-confetti
declare global {
  interface Window {
    confetti: any;
  }
}