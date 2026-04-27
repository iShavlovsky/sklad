import { type ReactElement, useState } from 'react';
import { Alert, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';

import { useArrivalDetails } from '@/features/arrivals/data/hooks/use-arrival-details.ts';
import { useArrivalList } from '@/features/arrivals/data/hooks/use-arrival-list.ts';
import { useCreateDraft } from '@/features/drafts/data/hooks/use-create-draft.ts';
import { useDraftDetails } from '@/features/drafts/data/hooks/use-draft-details.ts';
import { useUpdateDraft } from '@/features/drafts/data/hooks/use-update-draft.ts';
import { usePublishDraft } from '@/features/drafts/publish/hooks/use-publish-draft.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { FormSectionCard } from '@/shared/ui/form-shell';

import {
  applyLinkedArrivalToDraftValues,
  buildDraftPayload,
  getPublishErrorMessage,
} from './model/draft-editor.form-mappers.ts';
import type { DraftEditorMode } from './model/draft-editor.form-values.ts';
import { useDraftForm } from './model/use-draft-form.ts';
import { useDraftSectionNavigation } from './model/use-draft-section-navigation.ts';
import { DraftEditorFormActions } from './draft-editor.actions.tsx';
import { DraftEditorFormSections } from './draft-editor.sections.tsx';

const ARRIVAL_SELECT_SORT = {
  direction: 'desc',
  field: 'updatedAt',
} as const;

interface DraftEditorProps {
  draftId?: string | null;
  mode: DraftEditorMode;
}

export function DraftEditor({
  draftId,
  mode,
}: Readonly<DraftEditorProps>): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const createDraft = useCreateDraft();
  const updateDraft = useUpdateDraft();
  const publishDraft = usePublishDraft();
  const draftDetails = useDraftDetails(
    mode === 'edit' ? (draftId ?? null) : null
  );
  const [arrivalSearch, setArrivalSearch] = useState('');
  const [debouncedArrivalSearch] = useDebouncedValue(arrivalSearch, 150);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { form, occurredAtValue, setOccurredAtValue } = useDraftForm({
    draftDetails,
    mode,
  });
  const {
    openedSections,
    resolveErrorSection,
    scrollToSection,
    setOpenedSections,
  } = useDraftSectionNavigation();

  const kind =
    mode === 'edit' && draftDetails
      ? draftDetails.draft.kind
      : form.values.kind;
  const arrivals = useArrivalList({
    filters: {
      categoryId: null,
      createdAt: { from: null, to: null },
      hasCodes: null,
      occurredAt: { from: null, to: null },
      originKind: null,
      productId: null,
      search: debouncedArrivalSearch,
      subjectKind: null,
      supplierId: null,
    },
    limit: 100,
    offset: 0,
    sort: ARRIVAL_SELECT_SORT,
  });
  const arrivalOptions = arrivals.map((arrival) => ({
    label: `${arrival.title} - ${arrival.occurredAt}`,
    value: arrival.id,
  }));
  const linkedArrivalDetails = useArrivalDetails(
    kind === 'departure' && form.values.basedOnArrivalId !== ''
      ? form.values.basedOnArrivalId
      : null
  );

  function showError(message: string): void {
    actionFeedback.notify({
      kind: 'error',
      message,
      title: 'Черновик',
    });
  }

  function showSuccess(message: string): void {
    actionFeedback.notify({
      kind: 'success',
      message,
      title: 'Черновик',
    });
  }

  function handleApplyLinkedArrival(): void {
    if (!linkedArrivalDetails) {
      return;
    }

    form.setValues(
      applyLinkedArrivalToDraftValues(form.getValues(), linkedArrivalDetails)
    );
  }

  const handleSubmit = form.onSubmit(
    async (values) => {
      setIsSubmitting(true);

      try {
        const payload = buildDraftPayload(values);

        if (mode === 'create') {
          const result = await createDraft.execute({
            kind: values.kind,
            title: values.title.trim(),
            payload,
          });

          if (!result.ok) {
            showError('Не удалось сохранить черновик.');
            return;
          }

          showSuccess('Черновик сохранён.');
          navigate.to('root.drafts.edit', {
            params: { draftId: result.record.id },
            replace: true,
          });
          return;
        }

        if (!draftId) {
          showError('Черновик не найден.');
          return;
        }

        const result = await updateDraft.execute({
          id: draftId,
          kind: values.kind,
          title: values.title.trim(),
          payload,
        });

        if (!result.ok) {
          showError('Не удалось обновить черновик.');
          return;
        }

        showSuccess('Черновик сохранён.');
      } finally {
        setIsSubmitting(false);
      }
    },
    (errors) => {
      showError('Проверьте заполнение формы.');
      scrollToSection(resolveErrorSection(errors));
    }
  );

  async function handlePublish(): Promise<void> {
    if (mode !== 'edit' || !draftId) {
      return;
    }

    setIsPublishing(true);

    try {
      const result = await publishDraft.execute({
        id: draftId,
        targetKind: kind,
      });

      if (!result.ok) {
        showError(getPublishErrorMessage(result.code));
        return;
      }

      if (result.targetKind === 'arrival') {
        showSuccess('Черновик опубликован в приход.');
        navigate.to('root.arrivals.details', {
          params: { arrivalId: result.record.id },
          replace: true,
        });
        return;
      }

      showSuccess('Черновик опубликован в расход.');
      navigate.to('root.departures.details', {
        params: { departureId: result.record.id },
        replace: true,
      });
    } finally {
      setIsPublishing(false);
    }
  }

  if (mode === 'edit' && draftId && draftDetails === undefined) {
    return (
      <FormSectionCard>
        <Text c="dimmed" size="sm">
          Загрузка черновика...
        </Text>
      </FormSectionCard>
    );
  }

  if (mode === 'edit' && (!draftId || draftDetails === null)) {
    return (
      <FormSectionCard>
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} stroke={1.8} />}
          variant="light"
        >
          Черновик не найден.
        </Alert>
      </FormSectionCard>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'var(--sl-page-bottom-spacer)',
      }}
    >
      <DraftEditorFormSections
        arrivalOptions={arrivalOptions}
        form={form}
        isPublishing={isPublishing}
        kind={kind}
        linkedArrivalDetails={linkedArrivalDetails}
        mode={mode}
        occurredAtValue={occurredAtValue}
        openedSections={openedSections}
        onApplyLinkedArrival={handleApplyLinkedArrival}
        onClearLinkedArrival={() => {
          form.setFieldValue('basedOnArrivalId', '');
        }}
        onOccurredAtChange={setOccurredAtValue}
        onOpenedSectionsChange={setOpenedSections}
        onPublish={() => {
          void handlePublish();
        }}
        onSearchChange={setArrivalSearch}
        onSelectedArrivalChange={(value: string) => {
          form.setFieldValue('basedOnArrivalId', value);
        }}
      />

      <DraftEditorFormActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate.to('root.drafts')}
      />
    </form>
  );
}
