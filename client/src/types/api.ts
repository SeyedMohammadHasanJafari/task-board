export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    name?: string;
  };
}

export interface HelloResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
}
