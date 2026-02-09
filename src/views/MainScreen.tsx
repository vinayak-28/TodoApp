import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Todo, TodoId } from '../models/TodoModel';
import { useMainScreenController } from '../controllers/useMainScreenController';
import { COLORS, SPACING } from '../utils/constants';
import APP_TEXT from '../utils/appText.json';
import type { RootStackParamList } from '../../App';
import Header from '../components/Header';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const TodoRow = React.memo(function TodoRow(props: {
  todo: Todo;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  onEdit: (id: TodoId) => void;
}) {
  const { todo, onToggle, onDelete, onEdit } = props;

  // Lightweight animated feedback for completion state (RN Animated API).
  const anim = useRef(new Animated.Value(todo.completed ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: todo.completed ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [anim, todo.completed]);

  // Slide-out animation for delete
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const onPressToggle = () => onToggle(todo.id);
  const onPressEdit = () => onEdit(todo.id);
  const onPressDelete = () => {
    // Animate slide to left and fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -1000, // Slide completely off screen to the left
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, actually delete the item
      onDelete(todo.id);
    });
  };

  const checkScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const checkOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View
      style={[
        styles.row,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressToggle}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
      >
        <Animated.View style={[styles.checkboxInner, { opacity: checkOpacity, transform: [{ scale: checkScale }] }]} />
        {todo.completed ? <Text style={styles.checkMark}>✓</Text> : null}
      </TouchableOpacity>

      <View style={styles.rowText}>
        <Text style={[styles.title, todo.completed && styles.titleDone]} >
          {todo.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          id {todo.id} · updated {todo.updated_at.slice(0, 19).replace('T', ' ')}
        </Text>
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity activeOpacity={0.7} onPress={onPressEdit} style={styles.actionBtn}>
          <Image source={require('../assets/images/pen (1).png')} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onPressDelete} style={styles.actionBtn}>
          <Image source={require('../assets/images/recycle-bin.png')} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

function MainScreen({ navigation }: Props) {
  const {
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
  } = useMainScreenController(navigation);

  // Ref for FlatList to enable scrolling to top
  const flatListRef = useRef<FlatList<Todo>>(null);

  // Scroll to top when filter or sort changes
  useEffect(() => {
    if (flatListRef.current && todos.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [filter, sort, todos.length]);

  const keyExtractor = useCallback((item: Todo) => String(item.id), []);
  const renderItem = useCallback(
    ({ item }: { item: Todo }) => (
      <TodoRow todo={item} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    ),
    [onDelete, onEdit, onToggle],
  );

  return (
    <View style={styles.parentContainer}>
      <Header />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{APP_TEXT.mainScreen.title}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onPressAdd} style={styles.headerBtn}>
            <Image source={require('../assets/images/add-button.png')} style={styles.addIcon} />
            <Text style={styles.headerBtnText}>{APP_TEXT.common.add}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.counters}>
          <Text style={styles.counterText}>
            <Text style={styles.counterLabel}>{APP_TEXT.mainScreen.counters.total}: </Text>
            <Text style={styles.counterValue}>{total}
            </Text>
          </Text>
          <Text style={styles.counterText}>
            <Text style={styles.counterLabel}>{APP_TEXT.mainScreen.counters.completed}: </Text>
            <Text style={styles.counterValue}>{completed}
            </Text>
          </Text>
          
        </View>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            {filterOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.7}
                onPress={opt.onPress}
                style={[styles.pill, filter === opt.key && styles.pillActive]}
              >
                <Text style={[styles.pillText, filter === opt.key && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.controlGroup}>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.7}
                onPress={opt.onPress}
                style={[styles.pill, sort === opt.key && styles.pillActive]}
              >
                <Text style={[styles.pillText, sort === opt.key && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {fetchStatus === 'failed' ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onPressRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>
              {APP_TEXT.common.retry} ({fetchError ?? 'error'})
            </Text>
          </TouchableOpacity>
        ) : null}
        
        <FlatList
          ref={flatListRef}
          data={todos}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={todos.length === 0 ? styles.listEmptyContainer : undefined}
          ListEmptyComponent={<Text style={styles.emptyText}>{listEmptyText}</Text>}
          initialNumToRender={12}
          windowSize={10}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
        />

        <Modal
          visible={editing != null}
          transparent
          animationType="fade"
          onRequestClose={onCloseEdit}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{APP_TEXT.common.edit}</Text>
              <TextInput
                value={editing?.text ?? ''}
                onChangeText={onEditTextChange}
                placeholder={APP_TEXT.addTodoScreen.placeholderTitle}
                placeholderTextColor={COLORS.muted}
                style={styles.modalInput}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onCloseEdit}
                  style={styles.modalBtn}
                >
                  <Text style={styles.modalBtnText}>{APP_TEXT.common.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onSaveEdit}
                  disabled={!canSaveEdit}
                  style={[styles.modalBtn, !canSaveEdit && styles.buttonDisabled]}
                >
                  <Text style={styles.modalBtnText}>{APP_TEXT.common.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '800',
  },
  headerBtn: {
    borderWidth: 2,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addIcon: {
    width: 14,
    height: 14,
  },
  headerBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  counters: {
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.grey,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counterLabel: {
    color: COLORS.black,   
    fontWeight: '600',
  },
  counterValue: {
    color: COLORS.muted,  
    fontWeight: '600',
  },
  counterText: {
    color: COLORS.black,
    fontWeight: '700',
  },
  controls: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  controlGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
  },
  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.black,
    fontWeight: '500',
  },
  pillTextActive: {
    color: COLORS.bg,
    fontWeight: '600',
  },
  retryBtn: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  retryText: {
    color: COLORS.black,
    fontWeight: '700',
  },
  listEmptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    color: COLORS.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  checkMark: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
  },
  titleDone: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  rowActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  actionBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionText: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalTitle: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '800',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.black,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  modalBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  modalBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});

export default MainScreen;


