export interface IconJsonRpcResponse {
  jsonrpc: string;
  id: number;
  error?: Error;
  result?: string;
}

interface Error {
  code: number;
  message: string;
}
