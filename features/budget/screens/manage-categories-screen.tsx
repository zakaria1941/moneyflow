import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { ManageGroupCard } from '@/features/budget/components/manage-group-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategoriesStore } from '@/stores/categories-store';
import { useProfileStore } from '@/stores/profile-store';
import { GoalType } from '@/types';
import { computeGoalProgress } from '@/utils/budget-math';

export function ManageCategoriesScreen() {
  const groups = useCategoriesStore((s) => s.groups);
  const categories = useCategoriesStore((s) => s.categories);
  const categoryMonths = useCategoriesStore((s) => s.categoryMonths);
  const goals = useCategoriesStore((s) => s.goals);
  const isLoading = useCategoriesStore((s) => s.isLoading);
  const createGroup = useCategoriesStore((s) => s.createGroup);
  const updateGroup = useCategoriesStore((s) => s.updateGroup);
  const removeGroup = useCategoriesStore((s) => s.removeGroup);
  const createCategory = useCategoriesStore((s) => s.createCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const hideCategory = useCategoriesStore((s) => s.hideCategory);
  const createGoal = useCategoriesStore((s) => s.createGoal);
  const updateGoal = useCategoriesStore((s) => s.updateGoal);
  const removeGoal = useCategoriesStore((s) => s.removeGoal);
  const currency = useProfileStore((s) => s.profile?.currency ?? 'USD');
  const negative = useThemeColor({}, 'negative');

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupError, setNewGroupError] = useState<string | undefined>();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState<string | undefined>();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupDraftName, setGroupDraftName] = useState('');
  const [groupDraftError, setGroupDraftError] = useState<string | undefined>();
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  const [confirmingRemoveGroupId, setConfirmingRemoveGroupId] = useState<string | null>(null);
  const [removeGroupErrors, setRemoveGroupErrors] = useState<Record<string, string>>({});

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraftName, setCategoryDraftName] = useState('');
  const [categoryDraftError, setCategoryDraftError] = useState<string | undefined>();
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [confirmingHideCategoryId, setConfirmingHideCategoryId] = useState<string | null>(null);
  const [hideCategoryError, setHideCategoryError] = useState<string | undefined>();

  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({});
  const [newCategoryErrors, setNewCategoryErrors] = useState<Record<string, string>>({});
  const [addingCategoryGroupId, setAddingCategoryGroupId] = useState<string | null>(null);

  const [editingGoalCategoryId, setEditingGoalCategoryId] = useState<string | null>(null);

  const visibleCategories = categories.filter((c) => !c.hidden);

  const goalsByCategory = useMemo(() => new Map(goals.map((g) => [g.categoryId, g])), [goals]);
  const goalProgressByCategory = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeGoalProgress>>();
    for (const goal of goals) {
      const categoryMonth = categoryMonths.find((cm) => cm.categoryId === goal.categoryId);
      map.set(goal.categoryId, computeGoalProgress(goal, categoryMonth));
    }
    return map;
  }, [goals, categoryMonths]);

  const isDuplicateGroupName = (name: string, ignoreId?: string) =>
    groups.some((g) => g.id !== ignoreId && g.name.trim().toLowerCase() === name.trim().toLowerCase());

  const isDuplicateCategoryName = (name: string, groupId: string, ignoreId?: string) =>
    visibleCategories.some(
      (c) => c.id !== ignoreId && c.groupId === groupId && c.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim();
    setCreateGroupError(undefined);
    if (!trimmed) {
      setNewGroupError('Enter a group name.');
      return;
    }
    if (isDuplicateGroupName(trimmed)) {
      setNewGroupError('A group with this name already exists.');
      return;
    }
    setNewGroupError(undefined);
    setIsCreatingGroup(true);
    try {
      await createGroup(trimmed);
      setNewGroupName('');
    } catch (err) {
      setCreateGroupError(err instanceof Error ? err.message : 'Could not create group. Please try again.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const startEditGroup = (id: string, name: string) => {
    setEditingGroupId(id);
    setGroupDraftName(name);
    setGroupDraftError(undefined);
    setConfirmingRemoveGroupId(null);
  };
  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setGroupDraftError(undefined);
  };
  const saveEditGroup = async () => {
    if (!editingGroupId) return;
    const trimmed = groupDraftName.trim();
    if (!trimmed) {
      setGroupDraftError('Enter a group name.');
      return;
    }
    if (isDuplicateGroupName(trimmed, editingGroupId)) {
      setGroupDraftError('A group with this name already exists.');
      return;
    }
    setIsSavingGroup(true);
    try {
      await updateGroup(editingGroupId, { name: trimmed });
      setEditingGroupId(null);
    } catch (err) {
      setGroupDraftError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleRemoveGroupPress = async (id: string) => {
    if (confirmingRemoveGroupId !== id) {
      setConfirmingRemoveGroupId(id);
      setRemoveGroupErrors((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    setConfirmingRemoveGroupId(null);
    try {
      await removeGroup(id);
      setRemoveGroupErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setRemoveGroupErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Could not remove group.' }));
    }
  };

  const startEditCategory = (id: string, name: string) => {
    setEditingCategoryId(id);
    setCategoryDraftName(name);
    setCategoryDraftError(undefined);
    setConfirmingHideCategoryId(null);
    setEditingGoalCategoryId(null);
  };
  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setCategoryDraftError(undefined);
  };
  const saveEditCategory = async () => {
    if (!editingCategoryId) return;
    const current = categories.find((c) => c.id === editingCategoryId);
    if (!current) return;
    const trimmed = categoryDraftName.trim();
    if (!trimmed) {
      setCategoryDraftError('Enter a category name.');
      return;
    }
    if (isDuplicateCategoryName(trimmed, current.groupId, editingCategoryId)) {
      setCategoryDraftError('A category with this name already exists in this group.');
      return;
    }
    setIsSavingCategory(true);
    try {
      await updateCategory(editingCategoryId, { name: trimmed });
      setEditingCategoryId(null);
    } catch (err) {
      setCategoryDraftError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleHideCategoryPress = async (id: string) => {
    if (confirmingHideCategoryId !== id) {
      setConfirmingHideCategoryId(id);
      return;
    }
    setConfirmingHideCategoryId(null);
    setHideCategoryError(undefined);
    try {
      await hideCategory(id);
    } catch (err) {
      setHideCategoryError(err instanceof Error ? err.message : 'Could not remove this category. Please try again.');
    }
  };

  const handleAddCategory = async (groupId: string) => {
    const trimmed = (newCategoryNames[groupId] ?? '').trim();
    if (!trimmed) {
      setNewCategoryErrors((prev) => ({ ...prev, [groupId]: 'Enter a category name.' }));
      return;
    }
    if (isDuplicateCategoryName(trimmed, groupId)) {
      setNewCategoryErrors((prev) => ({ ...prev, [groupId]: 'A category with this name already exists in this group.' }));
      return;
    }
    setNewCategoryErrors((prev) => ({ ...prev, [groupId]: '' }));
    setAddingCategoryGroupId(groupId);
    try {
      await createCategory(trimmed, groupId);
      setNewCategoryNames((prev) => ({ ...prev, [groupId]: '' }));
    } catch (err) {
      setNewCategoryErrors((prev) => ({
        ...prev,
        [groupId]: err instanceof Error ? err.message : 'Could not create category.',
      }));
    } finally {
      setAddingCategoryGroupId(null);
    }
  };

  const handleToggleGoalEditor = (categoryId: string) => {
    setEditingGoalCategoryId((current) => (current === categoryId ? null : categoryId));
    setEditingCategoryId(null);
  };

  const handleSaveGoal = async (categoryId: string, input: { type: GoalType; targetAmount: number; targetDate?: string }) => {
    const existing = goalsByCategory.get(categoryId);
    if (existing) {
      await updateGoal(existing.id, input);
    } else {
      await createGoal({ categoryId, ...input });
    }
    setEditingGoalCategoryId(null);
  };

  const handleRemoveGoal = async (goalId: string) => {
    await removeGoal(goalId);
    setEditingGoalCategoryId(null);
  };

  if (isLoading && groups.length === 0) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Categories</ThemedText>

        <Card style={styles.createCard}>
          <TextField
            label="New group"
            placeholder="e.g. Savings Goals"
            value={newGroupName}
            onChangeText={(text) => {
              setNewGroupName(text);
              setNewGroupError(undefined);
            }}
            error={newGroupError}
          />
          {createGroupError ? <ThemedText style={{ color: negative }}>{createGroupError}</ThemedText> : null}
          <Button title="Add Group" onPress={handleCreateGroup} loading={isCreatingGroup} />
        </Card>

        {hideCategoryError ? <ThemedText style={{ color: negative }}>{hideCategoryError}</ThemedText> : null}

        {sortedGroups.length === 0 ? (
          <EmptyState title="No groups yet" message="Add a group above to start organizing your categories." />
        ) : (
          sortedGroups.map((group) => (
            <ManageGroupCard
              key={group.id}
              group={group}
              categories={visibleCategories.filter((c) => c.groupId === group.id).sort((a, b) => a.order - b.order)}
              isEditingGroup={editingGroupId === group.id}
              groupDraftName={groupDraftName}
              groupDraftError={editingGroupId === group.id ? groupDraftError : undefined}
              isSavingGroup={isSavingGroup}
              onStartEditGroup={() => startEditGroup(group.id, group.name)}
              onChangeGroupDraft={setGroupDraftName}
              onSaveGroup={saveEditGroup}
              onCancelGroup={cancelEditGroup}
              isConfirmingRemoveGroup={confirmingRemoveGroupId === group.id}
              onRemoveGroupPress={() => handleRemoveGroupPress(group.id)}
              removeGroupError={removeGroupErrors[group.id] || undefined}
              editingCategoryId={editingCategoryId}
              categoryDraftName={categoryDraftName}
              categoryDraftError={categoryDraftError}
              isSavingCategory={isSavingCategory}
              confirmingHideCategoryId={confirmingHideCategoryId}
              onStartEditCategory={startEditCategory}
              onChangeCategoryDraft={setCategoryDraftName}
              onSaveCategory={saveEditCategory}
              onCancelCategory={cancelEditCategory}
              onHideCategoryPress={handleHideCategoryPress}
              newCategoryName={newCategoryNames[group.id] ?? ''}
              newCategoryError={newCategoryErrors[group.id] || undefined}
              isAddingCategory={addingCategoryGroupId === group.id}
              onChangeNewCategoryName={(value) => setNewCategoryNames((prev) => ({ ...prev, [group.id]: value }))}
              onAddCategory={() => handleAddCategory(group.id)}
              currency={currency}
              goalsByCategory={goalsByCategory}
              goalProgressByCategory={goalProgressByCategory}
              editingGoalCategoryId={editingGoalCategoryId}
              onToggleGoalEditor={handleToggleGoalEditor}
              onSaveGoal={handleSaveGoal}
              onRemoveGoal={handleRemoveGoal}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  createCard: {
    gap: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
