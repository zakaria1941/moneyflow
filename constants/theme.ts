/**
 * MoneyFlow design tokens. Colors are defined for light and dark mode; every other file
 * reads them through `useThemeColor` rather than hardcoding hex values, so the palette
 * stays centralized here.
 *
 * Palette rationale: the brand color is a deep teal, deliberately distinct from both the
 * `positive` green and `negative` red — a finance app that used green as its brand color
 * too would make "this is a themed button" and "this number is good news" visually
 * ambiguous. Teal reads as calm/trustworthy without the generic-SaaS-purple or
 * cliché-bank-blue feel, and backgrounds lean a whisper warm rather than clinical white.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0F766E';
const tintColorDark = '#2DD4BF';

export const Colors = {
  light: {
    text: '#171717',
    background: '#F7F7F5',
    card: '#FFFFFF',
    border: '#E7E6E2',
    muted: '#6B7280',
    tint: tintColorLight,
    /** Text/icon color for content placed on top of a tint-colored surface (primary
     *  buttons, selected chips) — centralized here instead of the light/dark override
     *  every such component used to duplicate individually. */
    onTint: '#FFFFFF',
    icon: '#6B7280',
    tabIconDefault: '#9CA3A1',
    tabIconSelected: tintColorLight,
    positive: '#16803D',
    negative: '#DC2626',
    warning: '#B45309',
  },
  dark: {
    text: '#F2F2F0',
    background: '#111312',
    card: '#1B1E1D',
    border: '#2B2E2C',
    muted: '#9BA19E',
    tint: tintColorDark,
    onTint: '#0B1F1C',
    icon: '#9BA19E',
    tabIconDefault: '#6C716F',
    tabIconSelected: tintColorDark,
    positive: '#4ADE80',
    negative: '#F87171',
    warning: '#FBBF24',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

/** Subtle shadow only — Android's `elevation` and iOS's shadow props both read from
 *  this, kept deliberately faint (a hint of lift, not a drop shadow) per the app's
 *  restrained visual language. Dark mode skips it: surfaces already separate from the
 *  background via the card/border color step, and shadows barely read on dark
 *  backgrounds anyway, so adding one there would just be visual noise. */
export const Elevation = {
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
    android: { elevation: 1 },
    default: {},
  }),
  none: {},
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
