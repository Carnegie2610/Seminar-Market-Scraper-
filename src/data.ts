import { addDays, format, subDays } from 'date-fns';

export type FormatType = 'Online' | 'Präsenz' | 'Hybrid';
export type LanguageType = 'German' | 'English' | 'Both';

export interface Seminar {
  id: string;
  provider: string;
  seminar_title: string;
  category: string;
  sub_topic: string;
  termin: string; // ISO date string
  duration: string;
  format: FormatType;
  has_live_chat: boolean;
  price: number | null;
  frequency: string;
  language: LanguageType;
  certification: boolean;
  url: string;
}

const PROVIDERS = [
  'IT Schulung', 'ETC', 'GFU', 'CMT', 'IT-Visions', 'NobleProg', 'HCO', 
  'Haufe Akademie', 'PC College', 'SoftEd', 'ppedv', 'Cegos', 'Akademie Herkert', 'Prokoda'
];

const CATEGORIES = {
  'Cloud': ['Azure', 'AWS', 'Google Cloud', 'Terraform', 'Kubernetes'],
  'Programming': ['Python', 'Java', 'C#', 'JavaScript', 'Rust'],
  'Data & AI': ['Machine Learning', 'Databricks', 'Power BI', 'SQL', 'GenAI'],
  'Methodology': ['Scrum', 'Agile', 'ITIL', 'Prince2', 'DevOps'],
  'SAP': ['S/4HANA', 'ABAP', 'SAP FI/CO', 'SAP MM'],
};

const FORMATS: FormatType[] = ['Online', 'Präsenz', 'Online', 'Hybrid'];
const LANGUAGES: LanguageType[] = ['German', 'German', 'English', 'Both'];
const FREQUENCIES = ['1x / month', '2x / month', '1x / quarter', 'On Demand'];
const DURATIONS = ['1 day', '2 days', '3 days', '5 days', '4 hours'];

export function generateMockSeminars(count: number): Seminar[] {
  const seminars: Seminar[] = [];
  const baseDate = new Date();

  for (let i = 0; i < count; i++) {
    const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];
    const catKeys = Object.keys(CATEGORIES);
    const category = catKeys[Math.floor(Math.random() * catKeys.length)];
    const subTopics = CATEGORIES[category as keyof typeof CATEGORIES];
    const sub_topic = subTopics[Math.floor(Math.random() * subTopics.length)];
    
    const title_prefixes = ['Advanced', 'Introduction to', 'Masterclass:', 'Bootcamp:', 'Intensive:'];
    const prefix = Math.random() > 0.5 ? title_prefixes[Math.floor(Math.random() * title_prefixes.length)] + ' ' : '';
    const seminar_title = `${prefix}${sub_topic} for Professionals`;

    // Generate a random date within -30 to +90 days
    const dayOffset = Math.floor(Math.random() * 120) - 30;
    const termin = addDays(baseDate, dayOffset).toISOString();

    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
    const duration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    
    // Price between 400 and 3500, rounded to tens. 10% chance of no public price.
    const price = Math.random() > 0.1 ? Math.floor(Math.random() * 310 + 40) * 10 : null;

    seminars.push({
      id: `SEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      provider,
      seminar_title,
      category,
      sub_topic,
      termin,
      duration,
      format,
      has_live_chat: format === 'Online' || format === 'Hybrid' ? Math.random() > 0.3 : false,
      price,
      frequency: FREQUENCIES[Math.floor(Math.random() * FREQUENCIES.length)],
      language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
      certification: Math.random() > 0.4,
      url: `https://${provider.toLowerCase().replace(/\s+/g, '')}.de/seminars/${Math.random().toString(36).substring(2, 6)}`
    });
  }

  // Sort by date initially
  return seminars.sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime());
}

// Generate a static dataset so it doesn't change on every render
export const INITIAL_DATA = generateMockSeminars(500);
