import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import type { AppDispatch } from '../store';
import { addTodo } from '../store/todoSlice';

/**
 * - owns local UI state
 * - exposes handlers + derived flags
 * - keeps screen component mostly presentational
 */
export function useAddTodoScreenController(
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTodo'>,
) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState<string>('');

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const onPressAdd = () => {
    dispatch(addTodo({ title }));
    navigation.goBack();
  };

  const onSubmitEditing = canSubmit ? onPressAdd : undefined;

  return {
    title,
    setTitle,
    canSubmit,
    onPressAdd,
    onSubmitEditing,
  };
}


