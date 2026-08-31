import { StyleSheet, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressBarProps {
  /** 0–1, clamped */
  fraction: number;
  height?: number;
  /** Overrides the default tint fill — e.g. the warning color past 100%. */
  color?: string;
}

/** Shared progress track — used by Goals and Reports' category-spending bars so both
 *  render identically instead of each screen implementing its own bar. */
export function ProgressBar({ fraction, height = 6, color }: ProgressBarProps) {
  const track = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const clamped = Math.max(0, Math.min(1, fraction));
  // A sliver stays visible even at very low-but-nonzero progress, otherwise a 1% goal
  // renders as an empty track and looks indistinguishable from 0%.
  const widthPct = clamped > 0 ? Math.max(clamped * 100, 3) : 0;

  return (
    <View style={[styles.track, { height, borderRadius: Radii.pill, backgroundColor: track }]}>
      <View style={[styles.bar, { width: `${widthPct}%`, backgroundColor: color ?? tint, borderRadius: Radii.pill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
});
