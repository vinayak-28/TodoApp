import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Todo, TodoId } from '../models/TodoModel';
import type { TodoApiResponse } from '../network/todoApi';
import { nextTodoIdFromExisting, normalizeTitle, nowIso } from '../utils/helpers';
import type { StoreState } from './index';

export interface TodoState {
  items: Todo[];
  nextId: TodoId;
}

const initialState: TodoState = {
  items: [],
  nextId: 1,
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    setTodosFromApi(state, action: PayloadAction<{ todos: TodoApiResponse[] }>) {
      const timestamp = nowIso();
      const items: Todo[] = action.payload.todos.map(remoteTodo => ({
        id: remoteTodo.id,
        title: remoteTodo.title,
        completed: remoteTodo.completed,
        created_at: timestamp,
        updated_at: timestamp,
      }));

      state.items = items;
      state.nextId = nextTodoIdFromExisting(items.map(todo => todo.id));
    },
    addTodo(state, action: PayloadAction<{ title: string }>) {
      const title = normalizeTitle(action.payload.title);
      if (!title) return;

      const timestamp = nowIso();
      const todo: Todo = {
        id: state.nextId,
        title,
        completed: false,
        created_at: timestamp,
        updated_at: timestamp,
      };
      state.nextId = (state.nextId + 1) as TodoId;
      state.items.unshift(todo);
    },
    toggleTodo(state, action: PayloadAction<{ id: TodoId }>) {
      const id = action.payload.id;
      const idx = state.items.findIndex(todo => todo.id === id);
      if (idx < 0) return;
      const existing = state.items[idx];
      state.items[idx] = { ...existing, completed: !existing.completed, updated_at: nowIso() };
    },
    deleteTodo(state, action: PayloadAction<{ id: TodoId }>) {
      state.items = state.items.filter(todo => todo.id !== action.payload.id);
    },
    editTodo(state, action: PayloadAction<{ id: TodoId; title: string }>) {
      const title = normalizeTitle(action.payload.title);
      if (!title) return;
      const idx = state.items.findIndex(todo => todo.id === action.payload.id);
      if (idx < 0) return;
      const existing = state.items[idx];
      state.items[idx] = { ...existing, title, updated_at: nowIso() };
    },
  },
});

export const {
  addTodo,
  deleteTodo,
  editTodo,
  toggleTodo,
  setTodosFromApi,
} = todoSlice.actions;

export const todoReducer = todoSlice.reducer;