import type { MantineColorsTuple } from '@mantine/core';

export type AppThemeColorName =
  | 'brandBlue'
  | 'neutralSlate'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export const brandBluePalette: MantineColorsTuple = [
  '#e7eeff',
  '#cfe2ff',
  '#a3c6ff',
  '#7da8ff',
  '#598bff',
  '#3686ff',
  '#2160d6',
  '#1749a8',
  '#0f2d75',
  '#06103a',
];

export const neutralSlatePalette: MantineColorsTuple = [
  '#f6fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
];

export const successPalette: MantineColorsTuple = [
  '#edfdf3',
  '#d9fbe6',
  '#b4f3c8',
  '#86e8a5',
  '#58dc81',
  '#34d067',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
];

export const warningPalette: MantineColorsTuple = [
  '#fff9eb',
  '#fff1c4',
  '#ffe387',
  '#ffd149',
  '#ffc123',
  '#f9ae0b',
  '#e99807',
  '#ca7905',
  '#a85f08',
  '#8a4b0b',
];

export const errorPalette: MantineColorsTuple = [
  '#fff1f2',
  '#ffe0e3',
  '#ffc8ce',
  '#ffa1ab',
  '#ff6f7d',
  '#f8485d',
  '#ef4444',
  '#d62239',
  '#b31a31',
  '#95192e',
];

export const infoPalette: MantineColorsTuple = [
  '#eef6ff',
  '#d9e9ff',
  '#b9d7ff',
  '#87bbff',
  '#579dff',
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  '#1d3faa',
  '#1c3686',
];

export const appColorPalettes: Record<AppThemeColorName, MantineColorsTuple> = {
  brandBlue: brandBluePalette,
  neutralSlate: neutralSlatePalette,
  success: successPalette,
  warning: warningPalette,
  error: errorPalette,
  info: infoPalette,
};
