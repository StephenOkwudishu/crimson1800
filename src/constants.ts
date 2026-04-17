export type Page = 'DASHBOARD' | 'FORECAST' | 'GOVERNORSHIP' | 'MAPS' | 'HISTORICAL' | 'SECURITY' | 'LAB' | 'LOGISTICS' | 'NASS' | 'SENTIMENT' | 'PVT';

export interface NavLink {
  id: Page;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { id: 'DASHBOARD', label: 'DASHBOARD' },
  { id: 'FORECAST', label: 'PRESIDENTIAL FORECAST' },
  { id: 'GOVERNORSHIP', label: 'GOVERNORSHIP TRACKER' },
  { id: 'MAPS', label: 'INTERACTIVE MAPS' },
  { id: 'HISTORICAL', label: 'HISTORICAL DATA' },
  { id: 'SECURITY', label: 'SECURITY MONITOR' },
  { id: 'LAB', label: 'VISUAL LAB' },
  { id: 'LOGISTICS', label: 'INEC LOGISTICS' },
  { id: 'NASS', label: 'NASS BATTLE' },
  { id: 'SENTIMENT', label: 'SENTIMENT RADAR' },
  { id: 'PVT', label: 'PVT PORTAL' },
];

export interface ElectionDate {
  date: string;
  label: string;
  type: 'ELECTION' | 'PRIMARY' | 'SUBMISSION' | 'PUBLICATION' | 'CAMPAIGN';
}

export const TIMELINE_DATES: ElectionDate[] = [
  { date: '2026-01-16', label: 'INEC Issues Election Notice', type: 'PUBLICATION' },
  { date: '2026-04-23', label: 'Party Primaries Window Opens', type: 'PRIMARY' },
  { date: '2026-05-30', label: 'Party Primaries Window Closes', type: 'PRIMARY' },
  { date: '2027-01-16', label: 'Presidential & NASS Election', type: 'ELECTION' },
  { date: '2027-02-19', label: 'Campaign Period Closes', type: 'CAMPAIGN' },
  { date: '2027-03-06', label: 'Governorship & State Assembly Election', type: 'ELECTION' },
];

export const SECURITIES_DATA = [
  { date: '2025-12-01', 'NGSE:ASI': 98000, 'NGSE:BANKING': 750, 'NGE': 11.8, 'Yield': 4.8 },
  { date: '2026-01-01', 'NGSE:ASI': 99500, 'NGSE:BANKING': 780, 'NGE': 12.1, 'Yield': 5.0 },
  { date: '2026-02-01', 'NGSE:ASI': 100200, 'NGSE:BANKING': 790, 'NGE': 12.3, 'Yield': 5.1 },
  { date: '2026-03-01', 'NGSE:ASI': 100000, 'NGSE:BANKING': 800, 'NGE': 12.5, 'Yield': 5.2 },
  { date: '2026-04-01', 'NGSE:ASI': 102500, 'NGSE:BANKING': 820, 'NGE': 13.0, 'Yield': 5.3 },
  { date: '2026-05-01', 'NGSE:ASI': 103100, 'NGSE:BANKING': 845, 'NGE': 13.2, 'Yield': 5.42 },
];

export const ELECTION_EVENTS = [
  { date: '2026-01-16', description: 'INEC Issues Election Notice' },
  { date: '2026-04-23', description: 'Party Primaries Begin' },
  { date: '2026-11-18', description: 'Campaign Period Opens' },
  { date: '2027-01-16', description: 'Presidential Election' },
  { date: '2027-02-19', description: 'Campaign Period Closes' },
];

export const SECURITIES_TICKERS = {
  ASI: 'NGSE:ASI',
  BANKING: 'NGSE:BANKING',
  EUROBOND: 'XS2713443922',
  NGE: 'NGE',
  AFK: 'AFK',
};

export const STATE_MONITOR_MAPPING: Record<string, string> = {
  'Lagos': 'https://citizenmonitors.com/lagos',
  'Kano': 'https://citizenmonitors.com/kano',
  'Rivers': 'https://citizenmonitors.com/rivers',
  // Add other specific mappings as needed
};
