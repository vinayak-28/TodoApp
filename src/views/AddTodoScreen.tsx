import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAddTodoScreenController } from '../controllers/useAddTodoScreenController';
import { COLORS, SPACING } from '../utils/constants';
import APP_TEXT from '../utils/appText.json';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTodo'>;

function AddTodoScreen({ navigation }: Props) {
  const { title, setTitle, canSubmit, onPressAdd, onSubmitEditing } =
    useAddTodoScreenController(navigation);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{APP_TEXT.addTodoScreen.title}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={APP_TEXT.addTodoScreen.placeholderTitle}
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        autoFocus
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
      />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressAdd}
        disabled={!canSubmit}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{APP_TEXT.common.add}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: SPACING.xl,
  },
  label: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.black,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  button: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AddTodoScreen;


