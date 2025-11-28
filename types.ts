export type SecretType = 'password' | 'jwt' | 'uuid' | 'apiKey';

export interface SecretConfig {
  type: SecretType;
  // Password specific
  length?: number;
  useSymbols?: boolean;
  useNumbers?: boolean;
  useUppercase?: boolean;
  // JWT/Key specific
  bits?: number; // 128, 256, 512
  format?: 'hex' | 'base64';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  isThinking?: boolean;
  toolCall?: SecretConfig; // If the AI decides we need to render a generator tool
  isError?: boolean; // Indicates if the message is an error report
}