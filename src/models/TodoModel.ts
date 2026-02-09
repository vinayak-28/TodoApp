export type TodoId = number;

/**
 * Core TODO model stored in Redux.
 * - `created_at` / `updated_at` are ISO strings for stable sorting and easy serialization.
 */
export interface Todo {
  id: TodoId;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}


