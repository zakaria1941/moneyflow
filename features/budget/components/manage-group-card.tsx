import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { ManageCategoryRow } from '@/features/budget/components/manage-category-row';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, CategoryGroup, CurrencyCode, Goal, GoalType } from '@/types';
import { GoalProgress } from '@/utils/budget-math';

interface ManageGroupCardProps {
  group: CategoryGroup;
  categories: Category[];

  isEditingGroup: boolean;
  groupDraftName: string;
  groupDraftError?: string;
  isSavingGroup: boolean;
  onStartEditGroup: () => void;
  onChangeGroupDraft: (value: string) => void;
  onSaveGroup: () => void;
  onCancelGroup: () => void;

  isConfirmingRemoveGroup: boolean;
  onRemoveGroupPress: () => void;
  removeGroupError?: string;

  editingCategoryId: string | null;
  categoryDraftName: string;
  categoryDraftError?: string;
  isSavingCategory: boolean;
  confirmingHideCategoryId: string | null;
  onStartEditCategory: (id: string, name: string) => void;
  onChangeCategoryDraft: (value: string) => void;
  onSaveCategory: () => void;
  onCancelCategory: () => void;
  onHideCategoryPress: (id: string) => void;

  newCategoryName: string;
  newCategoryError?: string;
  isAddingCategory: boolean;
  onChangeNewCategoryName: (value: string) => void;
  onAddCategory: () => void;

  currency: CurrencyCode;
  goalsByCategory: Map<string, Goal>;
  goalProgressByCategory: Map<string, GoalProgress>;
  editingGoalCategoryId: string | null;
  onToggleGoalEditor: (categoryId: string) => void;
  onSaveGoal: (categoryId: string, input: { type: GoalType; targetAmount: number; targetDate?: string }) => Promise<void>;
  onRemoveGoal: (goalId: string) => Promise<void>;
}

export function ManageGroupCard({
  group,
  categories,
  isEditingGroup,
  groupDraftName,
  groupDraftError,
  isSavingGroup,
  onStartEditGroup,
  onChangeGroupDraft,
  onSaveGroup,
  onCancelGroup,
  isConfirmingRemoveGroup,
  onRemoveGroupPress,
  removeGroupError,
  editingCategoryId,
  categoryDraftName,
  categoryDraftError,
  isSavingCategory,
  confirmingHideCategoryId,
  onStartEditCategory,
  onChangeCategoryDraft,
  onSaveCategory,
  onCancelCategory,
  onHideCategoryPress,
  newCategoryName,
  newCategoryError,
  isAddingCategory,
  onChangeNewCategoryName,
  onAddCategory,
  currency,
  goalsByCategory,
  goalProgressByCategory,
  editingGoalCategoryId,
  onToggleGoalEditor,
  onSaveGoal,
  onRemoveGoal,
}: ManageGroupCardProps) {
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <View style={styles.groupHeader}>
        {isEditingGroup ? (
          <View style={styles.editRow}>
            <View style={styles.editField}>
              <TextField placeholder="Group name" value={groupDraftName} onChangeText={onChangeGroupDraft} error={groupDraftError} autoFocus />
            </View>
            <Pressable onPress={onSaveGroup} disabled={isSavingGroup} style={styles.iconButton} hitSlop={8}>
              <Ionicons name="checkmark" size={20} color={positive} />
            </Pressable>
            <Pressable onPress={onCancelGroup} disabled={isSavingGroup} style={styles.iconButton} hitSlop={8}>
              <Ionicons name="close" size={20} color={negative} />
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable onPress={onStartEditGroup} style={styles.groupNameArea} hitSlop={4}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {group.name}
              </ThemedText>
            </Pressable>
            {isConfirmingRemoveGroup ? (
              <Pressable onPress={onRemoveGroupPress} hitSlop={8}>
                <ThemedText style={{ color: negative }}>Confirm remove group?</ThemedText>
              </Pressable>
            ) : (
              <Pressable onPress={onRemoveGroupPress} style={styles.iconButton} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={muted} />
              </Pressable>
            )}
          </>
        )}
      </View>
      {removeGroupError ? <ThemedText style={[styles.removeError, { color: negative }]}>{removeGroupError}</ThemedText> : null}

      <Card style={styles.card}>
        {categories.length === 0 ? (
          <ThemedText style={[styles.emptyGroup, { color: muted }]}>No categories in this group.</ThemedText>
        ) : (
          categories.map((category, index) => (
            <ManageCategoryRow
              key={category.id}
              category={category}
              isEditing={editingCategoryId === category.id}
              isConfirmingHide={confirmingHideCategoryId === category.id}
              draftName={categoryDraftName}
              draftError={editingCategoryId === category.id ? categoryDraftError : undefined}
              isSaving={isSavingCategory}
              isLast={index === categories.length - 1}
              onStartEdit={() => onStartEditCategory(category.id, category.name)}
              onChangeDraft={onChangeCategoryDraft}
              onSave={onSaveCategory}
              onCancel={onCancelCategory}
              onHidePress={() => onHideCategoryPress(category.id)}
              goal={goalsByCategory.get(category.id)}
              goalProgress={goalProgressByCategory.get(category.id)}
              currency={currency}
              isEditingGoal={editingGoalCategoryId === category.id}
              onToggleGoalEditor={() => onToggleGoalEditor(category.id)}
              onSaveGoal={(input) => onSaveGoal(category.id, input)}
              onRemoveGoal={() => {
                const goal = goalsByCategory.get(category.id);
                return goal ? onRemoveGoal(goal.id) : Promise.resolve();
              }}
            />
          ))
        )}
      </Card>

      <View style={styles.addRow}>
        <View style={styles.addField}>
          <TextField placeholder="New category name" value={newCategoryName} onChangeText={onChangeNewCategoryName} error={newCategoryError} />
        </View>
        <Pressable onPress={onAddCategory} disabled={isAddingCategory} style={styles.addButton} hitSlop={8}>
          <Ionicons name="add-circle" size={30} color={positive} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  groupNameArea: {
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
  removeError: {
    fontSize: 12,
    marginHorizontal: Spacing.xs,
  },
  card: {
    paddingVertical: Spacing.xs,
  },
  emptyGroup: {
    paddingVertical: Spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addField: {
    flex: 1,
  },
  addButton: {
    marginTop: Spacing.sm,
  },
});
