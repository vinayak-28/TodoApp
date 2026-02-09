import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useStore } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import type { Todo, TodoId } from '../models/TodoModel';
import type { AppDispatch, StoreState } from '../store';
import { deleteTodo, editTodo, setTodosFromApi, toggleTodo } from '../store/todoSlice';
import APP_TEXT from '../utils/appText.json';
import { getTodos } from '../network/todoApi';
import { compareIsoDesc, nowIso } from '../utils/helpers';

type EditingState = { id: TodoId; text: string } | null;

export type TodoFilter = 'ALL' | 'ACTIVE' | 'DONE';
export type TodoSort = 'MOST_RECENT' | 'ID';
export type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Controller uses local state for UI changes.
 * Redux is updated only when an action is performed (toggle/edit/delete) or when API data is fetched.
 */
export function useMainScreenController(
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>,
) {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<StoreState>();

  const [allTodos, setAllTodos] = useState<Todo[]>(() => store.getState().todo.items);
  const [filter, setFilter] = useState<TodoFilter>('ALL');
  const [sort, setSort] = useState<TodoSort>('MOST_RECENT');

  const [editing, setEditing] = useState<EditingState>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync local list from Redux when screen is focused (e.g., after adding a TODO on another screen).
  useFocusEffect(
    useCallback(() => {
      setAllTodos(store.getState().todo.items);
      return undefined;
    }, [store]),
  );

  const fetchTodosFromApi = async () => {
    setFetchStatus('loading');
    setFetchError(null);

    const res = await getTodos();
    if (!res.ok) {
      setFetchError(res.error.message);
      setFetchStatus('failed');
      return;
    }

    dispatch(setTodosFromApi({ todos: res.data }));
    setAllTodos(store.getState().todo.items);
    setFetchStatus('succeeded');
  };

  useEffect(() => {
     void fetchTodosFromApi();
  }, []);

  const onPressAdd = () => {
    navigation.navigate('AddTodo');
  };

  const total = useMemo(() => allTodos.length, [allTodos.length]);
  const completed = useMemo(
    () => allTodos.reduce((completedCount, todo) => completedCount + (todo.completed ? 1 : 0), 0),
    [allTodos],
  );

  const todos = useMemo(() => {
    const filtered =
      filter === 'ALL'
        ? allTodos
        : filter === 'ACTIVE'
          ? allTodos.filter(todo => !todo.completed)
          : allTodos.filter(todo => todo.completed);

    if (sort === 'ID') {
      return [...filtered].sort((leftTodo, rightTodo) => leftTodo.id - rightTodo.id);
    }

    return [...filtered].sort((leftTodo, rightTodo) => {
      const updatedAtCompare = compareIsoDesc(leftTodo.updated_at, rightTodo.updated_at);
      if (updatedAtCompare !== 0) return updatedAtCompare;
      const createdAtCompare = compareIsoDesc(leftTodo.created_at, rightTodo.created_at);
      if (createdAtCompare !== 0) return createdAtCompare;
      return rightTodo.id - leftTodo.id;
    });
  }, [allTodos, filter, sort]);

  const onToggle = useCallback(
    (id: TodoId) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(toggleTodo({ id }));
      setAllTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed, updated_at: nowIso() } : todo,
        ),
      );
    },
    [dispatch],
  );

  const onDelete = useCallback(
    (id: TodoId) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(deleteTodo({ id }));
      setAllTodos(prev => prev.filter(t => t.id !== id));
    },
    [dispatch],
  );

  const onEdit = useCallback(
    (id: TodoId) => {
      const existingTodo = allTodos.find(todo => todo.id === id);
      if (!existingTodo) return;
      setEditing({ id, text: existingTodo.title });
    },
    [allTodos],
  );

  const onPressRetry = () => {
    void fetchTodosFromApi();
  };

  const onCloseEdit = () => setEditing(null);
  const onSaveEdit = () => {
    if (!editing) return;
    dispatch(editTodo({ id: editing.id, title: editing.text }));
    setAllTodos(prev =>
      prev.map(todo =>
        todo.id === editing.id ? { ...todo, title: editing.text, updated_at: nowIso() } : todo,
      ),
    );
    setEditing(null);
  };

  const onEditTextChange = (text: string) => {
    setEditing(prev => (prev ? { ...prev, text } : prev));
  };

  const canSaveEdit = useMemo(() => (editing ? editing.text.trim().length > 0 : false), [editing]);

  const onChangeFilter = (next: TodoFilter) => setFilter(next);
  const onChangeSort = (next: TodoSort) => setSort(next);

  const filterOptions = useMemo(
    () =>
      [
        { key: 'ALL' as const, label: APP_TEXT.mainScreen.filters.all, onPress: () => onChangeFilter('ALL') },
        {
          key: 'ACTIVE' as const,
          label: APP_TEXT.mainScreen.filters.active,
          onPress: () => onChangeFilter('ACTIVE'),
        },
        { key: 'DONE' as const, label: APP_TEXT.mainScreen.filters.done, onPress: () => onChangeFilter('DONE') },
      ] as const,
    [onChangeFilter],
  );

  const sortOptions = useMemo(
    () =>
      [
        {
          key: 'MOST_RECENT' as const,
          label: APP_TEXT.mainScreen.sort.mostRecent,
          onPress: () => onChangeSort('MOST_RECENT'),
        },
        { key: 'ID' as const, label: APP_TEXT.mainScreen.sort.id, onPress: () => onChangeSort('ID') },
      ] as const,
    [onChangeSort],
  );

  const listEmptyText = useMemo(() => {
    if (fetchStatus === 'loading') return APP_TEXT.common.loading;
    if (fetchStatus === 'failed') return fetchError ?? 'Error';
    return APP_TEXT.common.emptyState;
  }, [fetchError, fetchStatus]);

  return {
    todos,
    total,
    completed,
    filter,
    sort,
    fetchStatus,
    fetchError,
    listEmptyText,

    editing,
    canSaveEdit,
    onCloseEdit,
    onSaveEdit,
    onEditTextChange,

    onPressAdd,
    onToggle,
    onDelete,
    onEdit,
    onPressRetry,

    filterOptions,
    sortOptions,
  };
}


