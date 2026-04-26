export const elevatedSurfaceStyles = {
  background:
    'linear-gradient(180deg, var(--sl-surface-glass-strong), var(--sl-surface-glass))',
  borderColor: 'var(--sl-surface-glass-border)',
  borderRadius: 'var(--sl-section-radius)',
  boxShadow: 'var(--sl-glass-shadow)',
  backdropFilter: 'blur(var(--sl-glass-blur))',
  WebkitBackdropFilter: 'blur(var(--sl-glass-blur))',
};

export const controlTransition =
  'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)';

export const controlLabelStyles = {
  color: 'var(--sl-text)',
  fontSize: 'var(--mantine-font-size-sm)',
  fontWeight: 700,
  marginBottom: '0.375rem',
};

export const controlDescriptionStyles = {
  color: 'var(--sl-muted-text)',
};

export const controlErrorStyles = {
  color: 'var(--mantine-color-error)',
};

export const inlineChoiceLabelStyles = {
  color: 'var(--sl-text)',
  fontSize: 'var(--mantine-font-size-sm)',
  fontWeight: 600,
};

export const inlineChoiceDescriptionStyles = {
  color: 'var(--sl-muted-text)',
  fontSize: 'var(--mantine-font-size-xs)',
};

export const comboboxDropdownStyles = {
  backgroundColor: 'var(--sl-surface-card)',
  border: '1px solid var(--sl-shell-border)',
  borderRadius: 'var(--sl-section-radius)',
  boxShadow: 'var(--sl-panel-shadow)',
};

export const comboboxOptionStyles = {
  borderRadius: 'var(--sl-control-radius)',
  color: 'var(--sl-text)',
  fontSize: 'var(--mantine-font-size-sm)',
  fontWeight: 600,
  transition: controlTransition,
};

export const filledInputStyles = {
  backgroundColor: 'var(--sl-surface-input)',
  borderColor: 'var(--sl-surface-input-border)',
  borderRadius: 'var(--sl-control-radius)',
  boxShadow: 'none',
  color: 'var(--sl-control-text)',
  fontSize: 'var(--input-fz, var(--mantine-font-size-sm))',
  transition: controlTransition,
};

export const inputSectionStyles = {
  color: 'var(--sl-muted-text)',
  fontSize: 'var(--input-fz, var(--mantine-font-size-sm))',
  transition:
    'color var(--duration-fast) var(--ease-standard), opacity var(--duration-fast) var(--ease-standard)',
};
