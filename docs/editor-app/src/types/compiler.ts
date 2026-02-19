// WASM compiler message types

export interface CompileRequest {
  type: 'compile';
  id: number;
  markdown: string;
  files?: Record<string, string>;
}

export interface CompileResultMessage {
  type: 'result';
  id: number;
  yaml: string;
  warnings: string[];
  error: null;
}

export interface CompileErrorMessage {
  type: 'error';
  id: number | null;
  error: string;
}

export interface ReadyMessage {
  type: 'ready';
}

export type WorkerMessage = CompileResultMessage | CompileErrorMessage | ReadyMessage;

export interface WorkerCompiler {
  compile: (markdown: string, files?: Record<string, string>) => Promise<{
    yaml: string;
    warnings: string[];
    error: string | null;
  }>;
  ready: Promise<void>;
  terminate: () => void;
}
