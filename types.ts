export type SecretType = 'password' | 'jwt' | 'uuid' | 'apiKey' | 'recipe' | 'note' | 'rsa' | 'hash';

export interface SecretConfig {
  type: SecretType;
  // Password specific
  length?: number;
  useSymbols?: boolean;
  useNumbers?: boolean;
  useUppercase?: boolean;
  // JWT/Key specific
  bits?: number; // 128, 256, 512, 1024, 2048, 4096
  format?: 'hex' | 'base64';
  // Recipe specific (Loot Crate)
  recipeItems?: {
    label: string;
    config: SecretConfig;
  }[];
}

export interface PromptItem {
  id: string;
  label: string;
  cmd: string; // The text to send to the AI
  desc: string;
  type: 'category' | 'command'; // Distinguish between navigating and executing
  items?: PromptItem[]; // If type is category, it contains items
}

export interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  url: string;
  type: 'external' | 'api';
  status?: 'disconnected' | 'connected';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  isThinking?: boolean;
  toolCall?: SecretConfig; // If the AI decides we need to render a generator tool
  isError?: boolean; // Indicates if the message is an error report
  expiresAt?: number; // Timestamp when message should be deleted
  originalTTL?: number; // Duration in ms
  prompts?: PromptItem[]; // List of clickable prompts/commands
  integrations?: IntegrationItem[]; // List of connectable tools
}