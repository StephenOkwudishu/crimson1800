
import { SECURITIES_DATA } from '../constants';

const FETCH_TIMEOUT = 5000;

const withTimeout = (promise: Promise<any>, timeout: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]);
};

// --- Mock Data Generators ---

export const generateMockResults = () => {
  return {
    totalVoters: 93500000,
    accreditedVoters: 25000000 + Math.floor(Math.random() * 5000000),
    pollingUnitsReported: 176846,
    results: [
      { party: 'APC', votes: 8000000 + Math.floor(Math.random() * 1000000) },
      { party: 'PDP', votes: 7000000 + Math.floor(Math.random() * 1000000) },
      { party: 'LP', votes: 6500000 + Math.floor(Math.random() * 1000000) },
      { party: 'NNPP', votes: 1500000 + Math.floor(Math.random() * 500000) },
    ],
    timestamp: new Date().toISOString(),
  };
};

export const generateMockSecurities = () => {
  return SECURITIES_DATA.map(d => ({
    ...d,
    'NGSE:ASI': d['NGSE:ASI'] + (Math.random() * 1000 - 500),
    'NGSE:BANKING': d['NGSE:BANKING'] + (Math.random() * 20 - 10),
    'NGE': d['NGE'] + (Math.random() * 0.5 - 0.25),
    'Yield': d['Yield'] + (Math.random() * 0.2 - 0.1),
    'AFK': 20 + (Math.random() * 5),
  }));
};

export const generateMockIncidents = () => {
  return [
    { id: Date.now() + 1, type: 'VOTER_INTIMIDATION', zone: 'KANO', time: '14:20', severity: 'HIGH', description: 'Reports of voters being turned away.' },
    { id: Date.now() + 2, type: 'LOGISTICS_DELAY', zone: 'LAGOS', time: '11:05', severity: 'MED', description: 'Late arrival of materials.' },
    { id: Date.now() + 3, type: 'PROTEST', zone: 'RIVERS', time: '09:45', severity: 'LOW', description: 'Peaceful assembly near PU.' },
  ];
};

// --- API Services ---

export const fetchIReVData = async (state?: string, lga?: string) => {
  try {
    const response = await withTimeout(
      fetch(`/api/mock/irev?state=${state || ''}&lga=${lga || ''}`),
      FETCH_TIMEOUT
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn('IReV Fetch failed, falling back to mock:', error);
    return generateMockResults();
  }
};

export const fetchDataphyteData = async (endpoint: string) => {
  try {
    const response = await withTimeout(
      fetch(`/api/mock/dataphyte/${endpoint}`),
      FETCH_TIMEOUT
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn('Dataphyte Fetch failed, falling back to mock:', error);
    return { data: 'Historical election data placeholder' };
  }
};

export const fetchStearsData = async () => {
  try {
    const response = await withTimeout(
      fetch(`/api/mock/stears/election`),
      FETCH_TIMEOUT
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn('Stears Fetch failed, falling back to mock:', error);
    return { analysis: 'Stears live analysis fallback' };
  }
};

export const fetchIncidentReports = async () => {
  try {
    const response = await withTimeout(
      fetch(`/api/mock/incidents`),
      FETCH_TIMEOUT
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn('Incident Fetch failed, falling back to mock:', error);
    return generateMockIncidents();
  }
};

export const fetchSecuritiesData = async (ticker: string) => {
  const apiKey = (import.meta as any).env.VITE_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.warn('Alpha Vantage API key missing, using mock data.');
    return generateMockSecurities();
  }

  try {
    const response = await withTimeout(
      fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`),
      FETCH_TIMEOUT
    );
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data['Note'] || data['Information']) throw new Error('Alpha Vantage Rate Limit/Info');
    return data;
  } catch (error) {
    console.warn(`Securities Fetch failed for ${ticker}, falling back to mock:`, error);
    return generateMockSecurities();
  }
};
