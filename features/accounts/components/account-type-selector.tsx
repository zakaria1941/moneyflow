import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from '@/features/accounts/constants';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AccountType } from '@/types';

const TYPES: AccountType[] = ['checking', 'savings', 'cash', 'credit_card'];

interface AccountTypeSelectorProps {
  value: AccountType;
  onChange: (type: AccountType) => void;
}

export function AccountTypeSelector({ value, onChange }: AccountTypeSelectorProps) {
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const onTintColor = useThemeColor({}, 'onTint');

  return (
    <View style={styles.container}>
      {TYPES.map((type) => {
        const selected = type === value;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[styles.chip, { backgroundColor: selected ? tint : card, borderColor: selected ? tint : border }]}>
            <Ionicons name={ACCOUNT_TYPE_ICON[type]} size={16} color={selected ? onTintColor : text} />
            <ThemedText style={[styles.label, { color: selected ? onTintColor : text }]}>
              {ACCOUNT_TYPE_LABEL[type]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
