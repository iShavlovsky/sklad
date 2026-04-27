import { FORM_PREFERENCE_KEYS } from '@/features/form-preferences/model/form-preferences.keys.ts';

import type { DraftEditorSectionName } from './draft-editor.form-values.ts';

export const DRAFT_EDITOR_SECTION_IDS: Record<DraftEditorSectionName, string> =
  {
    additional: 'draft-editor-section-additional',
    directories: 'draft-editor-section-directories',
    main: 'draft-editor-section-main',
    publishMeta: 'draft-editor-section-publish-meta',
    relation: 'draft-editor-section-relation',
  };

export const DRAFT_FORM_PREFERENCE_KEYS = {
  departureMode: FORM_PREFERENCE_KEYS.draft.departureMode,
  kind: FORM_PREFERENCE_KEYS.draft.kind,
  subjectKind: FORM_PREFERENCE_KEYS.draft.subjectKind,
} as const;
