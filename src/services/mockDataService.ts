
export interface ElectionHealthMetrics {
  registeredVoters: number;
  pvcsCollected: number;
  bvasDeployed: number;
  irevSuccessRate: number;
  securityIncidents: number;
  observerReports: number;
  legalCases: number;
}

export const generateHealthMetrics = (): ElectionHealthMetrics => ({
  registeredVoters: 93469008 + Math.floor(Math.random() * 5000),
  pvcsCollected: 87.4 + (Math.random() * 2),
  bvasDeployed: 176846,
  irevSuccessRate: 98.2 + (Math.random() * 1),
  securityIncidents: Math.floor(Math.random() * 15),
  observerReports: 12400 + Math.floor(Math.random() * 100),
  legalCases: 142 + Math.floor(Math.random() * 5),
});

export interface LogisticsUpdate {
  state: string;
  status: 'OPTIMAL' | 'DELAYED' | 'WAITING';
  bvasStatus: string;
}

export const STATES = [
  'ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO',
  'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO',
  'JIGAWA', 'KADUNA', 'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASARAWA',
  'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'
];

export const generateLogisticsData = () => {
  return STATES.map(state => ({
    state,
    materialStatus: Math.random() > 0.8 ? 'DELAYED' : 'OPTIMAL',
    bvasStatus: Math.random() > 0.9 ? 'ISSUE' : 'READY',
    completion: 70 + Math.random() * 30
  }));
};

export const generateIReVStream = () => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `PU-${Math.floor(Math.random() * 100000)}`,
    state: STATES[Math.floor(Math.random() * STATES.length)],
    time: new Date().toLocaleTimeString(),
    status: 'SUCCESS'
  }));
};
