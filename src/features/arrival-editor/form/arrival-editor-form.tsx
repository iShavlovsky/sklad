import { type ReactElement, useEffect, useRef, useState } from 'react';
import { Accordion, Button, Stack } from '@mantine/core';
import { useStore } from 'zustand';

import { formActionButtonPresets } from '@/app/theme/components/button.theme';
import { bufferApplyController } from '@/features/buffer-core/model/buffer-apply.controller.instance.ts';
import { bufferApplySessionStore } from '@/features/buffer-core/model/buffer-apply.session-store.ts';
import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { useCreateDraft } from '@/features/drafts-data/hooks/use-create-draft.ts';
import {
  FormSectionAccordion,
  formSectionAccordionProps,
} from '@/features/form-fields/form-section-accordion';
import { useAppNavigate } from '@/router';
import { getCreateArrivalOperationMessage } from '@/shared/i18n/arrival/create/get-create-arrival-operation-message.ts';
import { getUpdateArrivalOperationMessage } from '@/shared/i18n/arrival/update/get-update-arrival-operation-message.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { FormStickyActions } from '@/shared/ui/form-shell';

import { useCreateArrival } from '../hooks/use-create-arrival.ts';
import { useUpdateArrival } from '../hooks/use-update-arrival.ts';

import {
  ARRIVAL_EDITOR_COPY,
  ARRIVAL_FORM_SECTION_IDS,
} from './model/arrival-form.constants.ts';
import {
  buildArrivalDraftPayload,
  buildCreateArrivalInput,
  buildUpdateArrivalInput,
} from './model/arrival-form.mappers.ts';
import type {
  ArrivalEditorFormValues,
  ArrivalEditorMode,
} from './model/arrival-form.types.ts';
import { useArrivalForm } from './model/use-arrival-form.ts';
import { useArrivalSectionNavigation } from './model/use-arrival-section-navigation.ts';
import { ArrivalAdditionalSection } from './sections/additional-section';
import { ArrivalDirectoriesSection } from './sections/directories-section';
import { ArrivalMainSection } from './sections/main-section';
import { appendCopiedBufferValuesToArrivalCodes } from './arrival-buffer-apply.ts';

interface ArrivalEditorFormProps {
  arrivalId: string | null;
  initialValues: ArrivalEditorFormValues;
  mode: ArrivalEditorMode;
}

export function ArrivalEditorForm({
  arrivalId,
  initialValues,
  mode,
}: Readonly<ArrivalEditorFormProps>): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const createArrival = useCreateArrival();
  const createDraft = useCreateDraft();
  const updateArrival = useUpdateArrival();
  const [pendingAction, setPendingAction] = useState<'create' | 'draft' | null>(
    null
  );
  const [pendingBufferRequestId, setPendingBufferRequestId] = useState<
    string | null
  >(null);
  const handledBufferRequestIdRef = useRef<string | null>(null);
  const bufferItemCount = useStore(bufferStore, (state) => state.items.length);
  const lastBufferApplyResult = useStore(
    bufferApplySessionStore,
    (state) => state.lastResult
  );
  const { form, occurredAtValue, setOccurredAtValue } = useArrivalForm({
    initialValues,
    mode,
  });
  const {
    openedSections,
    resolveErrorSection,
    scrollToSection,
    setOpenedSections,
  } = useArrivalSectionNavigation();

  useEffect(() => {
    if (
      pendingBufferRequestId === null ||
      lastBufferApplyResult === null ||
      lastBufferApplyResult.requestId !== pendingBufferRequestId
    ) {
      return;
    }

    if (handledBufferRequestIdRef.current === lastBufferApplyResult.requestId) {
      return;
    }

    handledBufferRequestIdRef.current = lastBufferApplyResult.requestId;

    if (lastBufferApplyResult.code === 'applied') {
      form.setFieldValue(
        'codes',
        appendCopiedBufferValuesToArrivalCodes(
          form.getValues().codes,
          lastBufferApplyResult
        )
      );
      actionFeedback.notify({
        kind: 'success',
        message: `Добавлено кодов из буфера: ${lastBufferApplyResult.copiedValues.length}.`,
        title: 'Буфер',
      });
    }

    queueMicrotask(() => {
      setPendingBufferRequestId(null);
      bufferApplyController.clearLastResult();
    });
  }, [actionFeedback, form, lastBufferApplyResult, pendingBufferRequestId]);

  function handleOpenBufferPicker(): void {
    const openResult = bufferApplyController.openPicker({
      requester: {
        kind: 'arrival-form',
        context: {
          ...(arrivalId ? { recordId: arrivalId } : {}),
          source: mode,
        },
      },
      selectionMode: 'multiple',
      targetField: 'codes',
    });

    if (
      openResult.code === 'opened' ||
      openResult.code === 'noop-already-open'
    ) {
      handledBufferRequestIdRef.current = null;
      setPendingBufferRequestId(openResult.request.requestId);
      return;
    }

    showFormError(
      'Не удалось открыть буфер. Проверьте, что верхняя панель доступна, и попробуйте ещё раз.'
    );
  }

  function showFormError(message: string): void {
    actionFeedback.notify({
      kind: 'error',
      message,
      title: 'Приход',
    });
  }

  function showFormSuccess(message: string): void {
    actionFeedback.notify({
      kind: 'success',
      message,
      title: 'Приход',
    });
  }

  async function handleSaveDraft(): Promise<void> {
    const validation = form.validate();

    if (validation.hasErrors) {
      showFormError(ARRIVAL_EDITOR_COPY.operation.validationError);
      scrollToSection(resolveErrorSection(validation.errors));
      return;
    }

    setPendingAction('draft');

    try {
      const values = form.getValues();
      const result = await createDraft.execute({
        kind: 'arrival',
        title: values.title.trim(),
        payload: buildArrivalDraftPayload(values),
      });

      if (!result.ok) {
        showFormError(
          result.code === 'VALIDATION_ERROR'
            ? ARRIVAL_EDITOR_COPY.operation.validationError
            : ARRIVAL_EDITOR_COPY.operation.draftFailed
        );
        return;
      }

      showFormSuccess('Приход сохранён в черновик.');
      navigate.to('root.drafts.edit', {
        params: { draftId: result.record.id },
      });
    } finally {
      setPendingAction(null);
    }
  }

  const handleSubmit = form.onSubmit(
    async (values) => {
      setPendingAction('create');

      try {
        if (mode === 'create') {
          const result = await createArrival.execute(
            buildCreateArrivalInput(values)
          );

          if (!result.ok) {
            if (result.code === 'VALIDATION_ERROR') {
              showFormError(ARRIVAL_EDITOR_COPY.operation.validationError);
              return;
            }

            showFormError(getCreateArrivalOperationMessage('ru', result));
            return;
          }

          navigate.to('root.arrivals.edit', {
            params: { arrivalId: result.record.id },
            replace: true,
          });
          showFormSuccess('Приход создан.');
          return;
        }

        if (!arrivalId) {
          showFormError(ARRIVAL_EDITOR_COPY.operation.missingArrival);
          return;
        }

        const result = await updateArrival.execute(
          buildUpdateArrivalInput(arrivalId, values)
        );

        if (!result.ok) {
          if (result.code === 'VALIDATION_ERROR') {
            showFormError(ARRIVAL_EDITOR_COPY.operation.validationError);
            return;
          }

          showFormError(getUpdateArrivalOperationMessage('ru', result));
          return;
        }

        showFormSuccess(ARRIVAL_EDITOR_COPY.operation.saved);
      } finally {
        setPendingAction(null);
      }
    },
    (errors) => {
      showFormError(ARRIVAL_EDITOR_COPY.operation.validationError);
      scrollToSection(resolveErrorSection(errors));
    }
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack
        gap="var(--sl-page-section-gap)"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehaviorY: 'contain',
          paddingBottom: '0.75rem',
        }}
      >
        <div id={ARRIVAL_FORM_SECTION_IDS.main}>
          <ArrivalMainSection
            bufferItemCount={bufferItemCount}
            form={form}
            occurredAtValue={occurredAtValue}
            onOccurredAtChange={setOccurredAtValue}
            onOpenBufferPicker={handleOpenBufferPicker}
          />
        </div>

        <Accordion
          multiple
          onChange={(value) => {
            setOpenedSections(
              Array.isArray(value) ? value : value ? [value] : []
            );
          }}
          value={openedSections}
          {...formSectionAccordionProps}
        >
          <div id={ARRIVAL_FORM_SECTION_IDS.directories}>
            <FormSectionAccordion
              helpKey="section.directories.arrival"
              title="Справочники"
              value="directories"
            >
              <ArrivalDirectoriesSection form={form} />
            </FormSectionAccordion>
          </div>

          <div id={ARRIVAL_FORM_SECTION_IDS.additional}>
            <FormSectionAccordion
              helpKey="section.additional.arrival"
              title="Дополнительно"
              value="additional"
            >
              <ArrivalAdditionalSection form={form} />
            </FormSectionAccordion>
          </div>
        </Accordion>
      </Stack>

      <FormStickyActions
        primaryAction={
          <Button
            {...formActionButtonPresets.create}
            loading={pendingAction === 'create'}
            type="submit"
          >
            {mode === 'create' ? 'Создать' : ARRIVAL_EDITOR_COPY.submit[mode]}
          </Button>
        }
        secondaryAction={
          mode === 'create' ? (
            <Button
              {...formActionButtonPresets.save}
              loading={pendingAction === 'draft'}
              onClick={() => {
                void handleSaveDraft();
              }}
              type="button"
            >
              Сохранить
            </Button>
          ) : undefined
        }
      >
        <Button
          {...formActionButtonPresets.cancel}
          onClick={() => navigate.to('root.arrivals')}
          type="button"
        >
          {mode === 'create' ? 'Отмена' : 'К списку приходов'}
        </Button>
      </FormStickyActions>
    </form>
  );
}
