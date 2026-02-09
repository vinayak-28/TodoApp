import { API } from '../utils/constants';

export type NetworkResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; status?: number } };

export interface TodoApiResponse {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function getTodos(): Promise<NetworkResult<TodoApiResponse[]>> {
  try {
    const res = await fetch(`${API.baseUrl}/todos`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, error: { message: `HTTP ${res.status}`, status: res.status } };
    }
    const data = (await res.json()) as TodoApiResponse[];
    return { ok: true, data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: { message } };
  }
}


