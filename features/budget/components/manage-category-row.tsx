import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { GoalEditor } from '@/features/budget/components/goal-editor';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, CurrencyCode, Goal, GoalType } from '@/types';
import { GoalProgress } from '@/utils/budget-math';
import { formatCurrency } from '@/utils/currency';

interface ManageCategoryRowProps {
  category: Category;
  isEditing: boolean;
  isConfirmingHide: boolean;
  draftName: string;
  draftError?: string;
  isSaving: boolean;
  isLast?: boolean;
  onStartEdit: () => void;
  onChangeDraft: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onHidePress: () => void;

  goal?: Goal;
  goalProgress?: GoalProgress;
  currency: CurrencyCode;
  isEditingGoal: boolean;
  onToggleGoalEditor: () => void;
  onSaveGoal: (input: { type: GoalType; targetAmount: number; targetDate?: string }) => Promise<void>;
  onRemoveGoal: () => Promise<void>;
}

export function ManageCategoryRow({
  category,
  isEditing,
  isConfirmingHide,
  draftName,
  draftError,
  isSaving,
  isLast,
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancel,
  onHidePress,
  goal,
  goalProgress,
  currency,
  isEditingGoal,
  onToggleGoalEditor,
  onSaveGoal,
  onRemoveGoal,
}: ManageCategoryRowProps) {
  const border = useThemeColor({}, 'border');
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');
  const muted = useThemeColor({}, 'muted');
  const rowStyle = [styles.row, { borderBottomColor: border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }];

  if (isEditing) {
    return (
      <View style={rowStyle}>
        <View style={styles.editRow}>
          <View style={styles.editField}>
            <TextField placeholder="Category name" value={draftName} onChangeText={onChangeDraft} error={draftError} autoFocus />
          </View>
          <Pressable onPress={onSave} disabled={isSaving} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="checkmark" size={20} color={positive} />
          </Pressable>
          <Pressable onPress={onCancel} disabled={isSaving} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="close" size={20} color={negative} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={rowStyle}>
      <View style={styles.mainRow}>
        <Pressable onPress={onStartEdit} style={styles.nameArea} hitSlop={4}>
          <ThemedText numberOfLines={1}>{category.name}</ThemedText>
        </Pressable>
        {isConfirmingHide ? (
          <Pressable onPress={onHidePress} style={styles.confirmButton} hitSlop={8}>
            <ThemedText style={{ color: negative }}>Confirm remove?</ThemedText>
          </Pressable>
        ) : (
          <Pressable onPress={onHidePress} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={18} color={muted} />
          </Pressable>
        )}
      </View>

      {isEditingGoal ? (
        <GoalEditor goal={goal} onSave={onSaveGoal} onCancel={onToggleGoalEditor} onRemove={goal ? onRemoveGoal : undefined} />
      ) : (
        <Pressable onPress={onToggleGoalEditor} hitSlop={4}>
          <ThemedText style={[styles.goalText, { color: muted }]}>
            {goal
              ? `Goal: ${formatCurrency(goal.targetAmount, currency)}${goal.type === 'monthly_funding' ? '/mo' : ''}${
                  goalProgress ? ` · ${Math.round(goalProgress.fraction * 100)}%` : ''
                }`
              : '+ Add Goal'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  goalText: {
    fontSize: 12,
  },
  nameArea: {
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    flex: 1,
  },
  editField: {
    flex: 1,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  confirmButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
