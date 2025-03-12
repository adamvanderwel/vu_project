export interface ProductionEvent {
  time: string;
  duration: string;
  impact: number;
  reason: string;
  description: string;
  type: 'grid' | 'maintenance' | 'weather' | 'technical' | 'environmental';
  hour?: number;
  eventTypeData?: {
    icon: any;
    color: string;
    bgColor: string;
  };
}

export interface ProductionEventsMap {
  [date: string]: ProductionEvent[];
} 