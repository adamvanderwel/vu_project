export interface ProductionEvent {
  time: string;
  duration: string;
  impact: number;
  reason: string;
  description: string;
  type: 'grid' | 'maintenance' | 'weather';
}

export interface ProductionEventsMap {
  [date: string]: ProductionEvent[];
} 