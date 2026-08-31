import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, CategoryMonth, CurrencyCode, Goal } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface CategoryRowProps {
  category: Category;
  categoryMonth: CategoryMonth | undefined;
  currency: CurrencyCode;
  isEditing: boolean;
  isLast?: boolean;
  draftAmount: string;
  draftError?: string;
  isSaving: boolean;
  onStartEdit: () => void;
  onChangeDraft: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Undefined when this category has no goal — the row simply omits the Goal line. */
  goal?: Goal;
}

export function CategoryRow({
  category,
  categoryMonth,
  currency,
  isEditing,
  isLast,
  draftAmount,
  draftError,
  isSaving,
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancel,
  goal,
}: CategoryRowProps) {
  const border = useThemeColor({}, 'border');
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');
  const rowStyle = [styles.row, { borderBottomColor: border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }];

  if (isEditing) {
    return (
      <View style={rowStyle}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {category.name}
        </ThemedText>
        <View style={styles.editRow}>
          <View style={styles.editField}>
            <TextField
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={draftAmount}
              onChangeText={onChangeDraft}
              error={draftError}
              autoFocus
            />
          </View>
          <Pressable onPress={onSave} disabled={isSaving} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="checkmark" size={22} color={positive} />
          </Pressable>
          <Pressable onPress={onCancel} disabled={isSaving} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="close" size={22} color={negative} />
          </Pressable>
        </View>
      </View>
    );
  }

  const assigned = categoryMonth?.assigned ?? 0;
  const activity = categoryMonth?.activity ?? 0;
  const available = categoryMonth?.available ?? 0;

  return (
    <Pressable onPress={onStartEdit} style={rowStyle}>
      <ThemedText type="defaultSemiBold" numberOfLines={1}>
        {category.name}
      </ThemedText>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <ThemedText style={styles.metricLabel}>Assigned</ThemedText>
          <AmountText amount={assigned} currency={currency} colored={false} size={14} />
        </View>
        <View style={styles.metric}>
          <ThemedText style={styles.metricLabel}>Activity</ThemedText>
          <AmountText amount={activity} currency={currency} colored={false} size={14} />
        </View>
        <View style={[styles.metric, styles.metricEnd]}>
          <ThemedText style={styles.metricLabel}>Available</ThemedText>
          <AmountText amount={available} currency={currency} size={14} />
        </View>
      </View>
      {goal ? (
        <ThemedText style={styles.goalLine}>
          Goal {formatCurrency(goal.targetAmount, currency)}
          {goal.type === 'monthly_funding' ? '/mo' : ''}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricEnd: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  goalLine: {
    fontSize: 11,
    opacity: 0.6,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  editField: {
    flex: 1,
  },
  iconButton: {
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
