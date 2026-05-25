export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  correlation_id?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedData<T> {
  items: T[];
  cursor: string | null;
  has_more: boolean;
}

export interface HealthData {
  app: string;
  env: string;
  time: string;
}
