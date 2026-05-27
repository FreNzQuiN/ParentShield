import api from './client';
import type { ApiSuccessResponse } from '../../types/api';
import type { QueryLogResponse } from '../../types/activity';

export interface QueryLogParams {
  time_from_millis: number;
  time_to_millis: number;
  devices?: string[];
  statuses?: string[];
  search?: string;
  limit?: number;
  cursor?: string;
}

export async function fetchQueryLog(params: QueryLogParams): Promise<QueryLogResponse> {
  const { data } = await api.get<ApiSuccessResponse<QueryLogResponse>>('/logs/query', { params });
  return data.data;
}
