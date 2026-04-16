export type Page = 'DASHBOARD' | 'FORECAST' | 'GOVERNORSHIP' | 'MAPS' | 'HISTORICAL' | 'SECURITY' | 'LAB';

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
];

export interface ElectionDate {
  date: string;
  label: string;
  type: 'ELECTION' | 'PRIMARY' | 'SUBMISSION' | 'PUBLICATION' | 'CAMPAIGN';
}

export const TIMELINE_DATES: ElectionDate[] = [
  { date: '2026-04-23', label: 'Party Primaries Window Opens', type: 'PRIMARY' },
  { date: '2026-05-30', label: 'Party Primaries Window Closes', type: 'PRIMARY' },
  { date: '2026-06-01', label: 'Candidate Submission Begins', type: 'SUBMISSION' },
  { date: '2026-06-30', label: 'Candidate Submission Ends', type: 'SUBMISSION' },
  { date: '2026-07-15', label: 'Final Candidate List Published', type: 'PUBLICATION' },
  { date: '2026-11-18', label: 'Campaign Period Opens (Pres/NASS)', type: 'CAMPAIGN' },
  { date: '2027-02-19', label: 'Campaign Period Closes', type: 'CAMPAIGN' },
  { date: '2027-02-20', label: 'Presidential & NASS Election', type: 'ELECTION' },
  { date: '2027-03-06', label: 'Governorship & State Assembly Election', type: 'ELECTION' },
];
