import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PayeeRow } from '@/features/transactions/components/payee-row';
import { usePayeesStore } from '@/stores/payees-store';

export function ManagePayeesScreen() {
  const payees = usePayeesStore((s) => s.payees);
  const isLoading = usePayeesStore((s) => s.isLoading);
  const addPayee = usePayeesStore((s) => s.addPayee);
  const updatePayee = usePayeesStore((s) => s.updatePayee);
  const archivePayee = usePayeesStore((s) => s.archivePayee);
  const negative = useThemeColor({}, 'negative');

  const [newName, setNewName] = useState('');
  const [newError, setNewError] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftError, setDraftError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const [confirmingArchiveId, setConfirmingArchiveId] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | undefined>();

  // The store now holds archived payees too (so transactions that reference one can still
  // resolve its name) — this screen only manages active ones, same as how Category
  // Management only shows non-hidden categories.
  const activePayees = payees.filter((p) => !p.archived);

  const isDuplicateName = (name: string, ignoreId?: string) =>
    activePayees.some((p) => p.id !== ignoreId && p.name.trim().toLowerCase() === name.trim().toLowerCase());

  const handleCreate = async () => {
    const trimmed = newName.trim();
    setCreateError(undefined);
    if (!trimmed) {
      setNewError('Enter a payee name.');
      return;
    }
    if (isDuplicateName(trimmed)) {
      setNewError('A payee with this name already exists.');
      return;
    }
    setNewError(undefined);
    setIsCreating(true);
    try {
      await addPayee(trimmed);
      setNewName('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create payee. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setDraftName(currentName);
    setDraftError(undefined);
    setSaveError(undefined);
    setConfirmingArchiveId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftError(undefined);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setDraftError('Enter a payee name.');
      return;
    }
    if (isDuplicateName(trimmed, editingId)) {
      setDraftError('A payee with this name already exists.');
      return;
    }
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await updatePayee(editingId, trimmed);
      setEditingId(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchivePress = async (id: string) => {
    if (confirmingArchiveId !== id) {
      setConfirmingArchiveId(id);
      return;
    }
    setConfirmingArchiveId(null);
    setArchiveError(undefined);
    try {
      await archivePayee(id);
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Could not archive this payee. Please try again.');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Payees</ThemedText>

        <Card style={styles.createCard}>
          <TextField
            label="New payee"
            placeholder="e.g. Coffee Shop"
            value={newName}
            onChangeText={(text) => {
              setNewName(text);
              setNewError(undefined);
            }}
            error={newError}
          />
          {createError ? <ThemedText style={{ color: negative }}>{createError}</ThemedText> : null}
          <Button title="Add Payee" onPress={handleCreate} loading={isCreating} />
        </Card>

        {archiveError ? <ThemedText style={{ color: negative }}>{archiveError}</ThemedText> : null}
        {saveError ? <ThemedText style={{ color: negative }}>{saveError}</ThemedText> : null}

        {isLoading && payees.length === 0 ? (
          <ActivityIndicator style={styles.spinner} />
        ) : activePayees.length === 0 ? (
          <EmptyState title="No payees yet" message="Payees you add here will be available when adding transactions." />
        ) : (
          <Card style={styles.listCard}>
            {activePayees.map((payee, index) => (
              <PayeeRow
                key={payee.id}
                payee={payee}
                isEditing={editingId === payee.id}
                isConfirmingArchive={confirmingArchiveId === payee.id}
                draftName={draftName}
                draftError={editingId === payee.id ? draftError : undefined}
                isSaving={isSaving}
                isLast={index === activePayees.length - 1}
                onStartEdit={() => startEdit(payee.id, payee.name)}
                onChangeDraft={setDraftName}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onArchivePress={() => handleArchivePress(payee.id)}
              />
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  createCard: {
    gap: Spacing.sm,
  },
  listCard: {
    paddingVertical: Spacing.xs,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
});
