import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Payee } from '@/types';

interface PayeeRowProps {
  payee: Payee;
  isEditing: boolean;
  isConfirmingArchive: boolean;
  draftName: string;
  draftError?: string;
  isSaving: boolean;
  isLast?: boolean;
  onStartEdit: () => void;
  onChangeDraft: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onArchivePress: () => void;
}

export function PayeeRow({
  payee,
  isEditing,
  isConfirmingArchive,
  draftName,
  draftError,
  isSaving,
  isLast,
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancel,
  onArchivePress,
}: PayeeRowProps) {
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
            <TextField
              placeholder="Payee name"
              value={draftName}
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

  return (
    <View style={rowStyle}>
      <Pressable onPress={onStartEdit} style={styles.nameArea} hitSlop={4}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {payee.name}
        </ThemedText>
      </Pressable>
      {isConfirmingArchive ? (
        <Pressable onPress={onArchivePress} style={styles.confirmButton} hitSlop={8}>
          <ThemedText style={{ color: negative }}>Confirm archive?</ThemedText>
        </Pressable>
      ) : (
        <Pressable onPress={onArchivePress} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="archive-outline" size={20} color={muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
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
