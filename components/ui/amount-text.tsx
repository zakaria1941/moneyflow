import { Text, TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { CurrencyCode } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface AmountTextProps {
  /** minor units (cents) */
  amount: number;
  currency?: CurrencyCode;
  colored?: boolean;
  /** Prefix positive amounts with "+" — useful when income/expense need to read clearly without relying on color alone. */
  showSign?: boolean;
  size?: number;
  style?: TextStyle;
}

/** The one place every screen renders a money value, so sign/color/formatting/weight
 *  stay consistent app-wide. Larger sizes step up in weight automatically (a $4,200
 *  balance should read as more important than a $4.20 line item) rather than every
 *  caller having to remember to bump the weight themselves. */
function weightForSize(size: number): TextStyle['fontWeight'] {
  if (size >= 32) return '800';
  if (size >= 22) return '700';
  return '600';
}

export function AmountText({
  amount,
  currency = 'USD',
  colored = true,
  showSign = false,
  size = 16,
  style,
}: AmountTextProps) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');

  // Zero reads as visually neutral — neither the plain text color (which would look
  // like an ordinary, "successfully has a value" figure) nor positive/negative.
  const color = colored ? (amount < 0 ? negative : amount > 0 ? positive : muted) : text;
  const formatted = formatCurrency(amount, currency);
  const displayText = showSign && amount > 0 ? `+${formatted}` : formatted;

  return (
    <Text
      style={[
        { color, fontSize: size, fontWeight: weightForSize(size), fontVariant: ['tabular-nums'] },
        style,
      ]}>
      {displayText}
    </Text>
  );
}
