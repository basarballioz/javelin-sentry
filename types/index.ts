

export interface MonitorConfig {
  botToken: string;
  chatId: string;
  defaultIntervalSeconds: number;
  useRandomInterval?: boolean;
  soundEnabled: boolean;
  soundVariant: SoundVariant;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

export type SoundVariant = 'classic' | 'retro' | 'modern' | 'scifi' | 'subtle';

export enum ApiStatus {
  PENDING = 'PENDING',
  UP = 'UP',
  DOWN = 'DOWN',
  CHECKING = 'CHECKING',
  PAUSED = 'PAUSED',
}

export enum ValidationType {
  // Added DEFAULT to synchronize with root types.ts
  DEFAULT = 'DEFAULT',
  HTTP_STATUS = 'HTTP_STATUS',
  JSON_EXACT = 'JSON_EXACT',
  KEYWORD_MATCH = 'KEYWORD_MATCH',
}

export enum UserAgentType {
  SMART = 'SMART',
  CHROME_DESKTOP = 'CHROME_DESKTOP',
  SAFARI_IOS = 'SAFARI_IOS',
  FIREFOX_DESKTOP = 'FIREFOX_DESKTOP',
  GOOGLE_BOT = 'GOOGLE_BOT',
}

export interface ValidationConfig {
  type: ValidationType;
  jsonKey?: string;
  jsonValue?: string;
  keyword?: string;
  invertKeyword?: boolean;
}

export interface HistoryPoint {
  timestamp: number;
  latency: number | null;
  status: ApiStatus;
}

export interface Incident {
  id: string;
  startTime: number;
  endTime: number | null;
  error: string;
}

export interface ApiEntry {
  id: string;
  url: string;
  status: ApiStatus;
  paused?: boolean;
  createdAt: number;
  lastChecked: number | null;
  lastResponse?: string;
  uptime?: number;
  failureCount: number;
  totalChecks: number;
  totalDown: number;
  history: HistoryPoint[];
  incidents: Incident[];
  validationConfig: ValidationConfig;
  intervalSeconds: number;
  useRandomInterval?: boolean;
  currentRandomInterval?: number;
  userAgentType: UserAgentType;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface ApiResponse {
  ok?: boolean;
  uptime?: number;
  [key: string]: any;
}

export interface SavedSlot {
  id: number;
  timestamp: number | null;
  label: string;
  data: {
    apis: ApiEntry[];
    config: MonitorConfig;
  } | null;
}
