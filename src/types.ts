export interface Section {
  id: string;
  name: string;
  description?: string; // Optional pattern notes, e.g. "3 knit 3 purl"
  totalRows?: number;
  currentRow: number;
  startingStitches: number;
  shaping: {
    type: 'increase' | 'decrease' | 'none';
    frequency: number;
    amount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'finished' | 'archived';
  
  // Row counting
  currentRow: number;
  totalRows?: number;
  
  // Sections
  sections: Section[];
  
  // Pattern info
  patternUrl?: string;
  patternName?: string;
  
  notes?: string;
}

export interface RowLog {
  id: string;
  projectId: string;
  rowNumber: number;
  timestamp: number;
  notes?: string;
}
