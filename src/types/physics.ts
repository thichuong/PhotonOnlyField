export type SimulationMode = 'qft-field' | 'classical-wave' | 'classical-particle';

export interface FieldSettings {
  mode: SimulationMode;
  vacuumFluctuations: boolean;
  waveFrequency: number;
  amplitude: number;
  speed: number;
  photonEnergy: number; // in eV or relative units
  showWireframe: boolean;
  colorScheme: 'quantum-cyan' | 'energy-amber' | 'electric-violet';
  damping: number;
}

export interface TimelineMilestone {
  id: string;
  year: number | string;
  scientist: string;
  title: string;
  subtitle: string;
  theoryName: string;
  era: 'Cổ điển' | 'Chuyển giao' | 'Lượng tử Hiện đại';
  avatarUrl?: string;
  formulaLatex: string;
  formulaMeaning: string;
  paradigmShift: string;
  keyExperiment: string;
  simulationPreset: SimulationMode;
  fullExplanation: string;
  quote?: string;
}

export interface InteractiveExperiment {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  historicalContext: string;
  qftInsight: string;
}

