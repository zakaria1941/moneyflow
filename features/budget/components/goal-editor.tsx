import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChipSelect } from '@/components/ui/chip-select';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Goal, GoalType } from '@/types';
import { toMajorUnits, toMinorUnits } from '@/utils/currency';

const TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'monthly_funding', label: 'Monthly' },
  { value: 'target_balance', label: 'Target Balance' },
  { value: 'target_by_date', label: 'By Date' },
];

interface GoalEditorProps {
  /** Omitted when creating a new goal for this category. */
  goal?: Goal;
  onSave: (input: { type: GoalType; targetAmount: number; targetDate?: string }) => Promise<void>;
  onCancel: () => void;
  onRemove?: () => Promise<void>;
}

export function GoalEditor({ goal, onSave, onCancel, onRemove }: GoalEditorProps) {
  const [type, setType] = useState<GoalType>(goal?.type ?? 'monthly_funding');
  const [amountText, setAmountText] = useState(goal ? toMajorUnits(goal.targetAmount).toFixed(2) : '');
  const [dateText, setDateText] = useState(goal?.targetDate ?? '');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const muted = useThemeColor({}, 'muted');
  const negative = useThemeColor({}, 'negative');

  const handleSave = async () => {
    setSubmitError(undefined);
    let valid = true;

    const normalized = amountText.trim().replace(/,/g, '');
    const amount = Number(normalized);
    if (normalized === '' || Number.isNaN(amount) || amount <= 0) {
      setAmountError('Enter an amount greater than 0.');
      valid = false;
    } else {
      setAmountError(undefined);
    }

    if (type === 'target_by_date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(new Date(dateText).getTime())) {
        setDateError('Enter a date as YYYY-MM-DD.');
        valid = false;
      } else {
        setDateError(undefined);
      }
    } else {
      setDateError(undefined);
    }

    if (!valid) return;

    setIsSaving(true);
    try {
      await onSave({
        type,
        targetAmount: toMinorUnits(amount),
        targetDate: type === 'target_by_date' ? dateText : undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePress = async () => {
    if (!onRemove) return;
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    setIsSaving(true);
    setSubmitError(undefined);
    try {
      await onRemove();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not remove goal. Please try again.');
      setConfirmingRemove(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={[styles.label, { color: muted }]}>Goal Type</ThemedText>
        <ChipSelect options={TYPE_OPTIONS} value={type} onChange={(value) => setType(value as GoalType)} />
      </View>

      <TextField
        label="Target Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={setAmountText}
        error={amountError}
      />

      {type === 'target_by_date' ? (
        <TextField
          label="Target Date"
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          value={dateText}
          onChangeText={setDateText}
          error={dateError}
        />
      ) : null}

      {submitError ? <ThemedText style={{ color: negative }}>{submitError}</ThemedText> : null}

      <View style={styles.actions}>
        <ThemedText onPress={isSaving ? undefined : handleSave} style={styles.actionLink}>
          Save
        </ThemedText>
        <ThemedText onPress={isSaving ? undefined : onCancel} style={[styles.actionLink, { color: muted }]}>
          Cancel
        </ThemedText>
        {onRemove ? (
          <ThemedText onPress={isSaving ? undefined : handleRemovePress} style={[styles.actionLink, { color: negative }]}>
            {confirmingRemove ? 'Confirm remove?' : 'Remove Goal'}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
