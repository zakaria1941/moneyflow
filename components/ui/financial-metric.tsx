import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CurrencyCode } from '@/types';

interface FinancialMetricProps {
  label: string;
  amount: number;
  currency: CurrencyCode;
  /** 'strong' is for the one number in a row that matters most (e.g. Available). */
  emphasis?: 'normal' | 'strong';
  colored?: boolean;
  showSign?: boolean;
  align?: 'left' | 'right';
}

/** A labeled money value — the {label above, amount below} pairing used throughout the
 *  Dashboard (Income/Spending, Assigned/Activity/Available) so every metric reads the
 *  same way instead of each card hand-rolling its own label+amount layout. */
export function FinancialMetric({
  label,
  amount,
  currency,
  emphasis = 'normal',
  colored = false,
  showSign = false,
  align = 'left',
}: FinancialMetricProps) {
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={[styles.container, align === 'right' && styles.alignRight]}>
      <ThemedText type="caption" style={{ color: muted }}>
        {label}
      </ThemedText>
      <AmountText
        amount={amount}
        currency={currency}
        colored={colored}
        showSign={showSign}
        size={emphasis === 'strong' ? 20 : 15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs / 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});
