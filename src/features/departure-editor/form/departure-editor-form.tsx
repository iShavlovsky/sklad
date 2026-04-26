import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, Button, Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'zustand';

import { formActionButtonPresets } from '@/app/theme/components/button.theme';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import { useArrivalDetails } from '@/features/arrivals-data/hooks/use-arrival-details.ts';
import { useArrivalList } from '@/features/arrivals-data/hooks/use-arrival-list.ts';
import { bufferApplyController } from '@/features/buffer-core/model/buffer-apply.controller.instance.ts';
import { bufferApplySessionStore } from '@/features/buffer-core/model/buffer-apply.session-store.ts';
import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { useCreateDeparture } from '@/features/departure-editor/hooks/use-create-departure.ts';
import { useCreateDraft } from '@/features/drafts-data/hooks/use-create-draft.ts';
import {
  FormSectionAccordion,
  formSectionAccordionProps,
} from '@/features/form-fields/form-section-accordion';
import { getPreferredScannerTab } from '@/features/scanner-runtime/model/scanner-preferences.store.ts';
import type { StockDeparturePrefill } from '@/features/stock-departure-prefill/stock-departure-prefill.ts';
import { browserScannerRuntimeController } from '@/infrastructure/browser/scanner/runtime/controller.instance.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { FormStickyActions } from '@/shared/ui/form-shell';

import {
  DEPARTURE_EDITOR_COPY,
  DEPARTURE_FORM_SECTION_IDS,
} from './model/departure-form.constants.ts';
import {
  applyLinkedArrivalToDepartureValues,
  buildCreateDepartureInput,
  buildDepartureDraftPayload,
  createEmptyDepartureEditorValues,
  getCreateDepartureOperationMessage,
} from './model/departure-form.mappers.ts';
import { useDepartureForm } from './model/use-departure-form.ts';
import { useDepartureSectionNavigation } from './model/use-departure-section-navigation.ts';
import { DepartureAdditionalSection } from './sections/additional-section';
import { DepartureDirectoriesSection } from './sections/directories-section';
import { DepartureMainSection } from './sections/main-section';
import { DepartureRelationSection } from './sections/relation-section';
import { appendCopiedBufferValuesToDepartureCodes } from './departure-buffer-apply.ts';

interface DepartureEditorFormProps {
  onCancel: () => void;
  onCreated: (record: DepartureRecord) => void;
  prefill?: StockDeparturePrefill;
}

const ARRIVAL_SELECT_SORT = {
  field: 'updatedAt',
  direction: 'desc',
} as const;

export function DepartureEditorForm({
  onCancel,
  onCreated,
  prefill,
}: Readonly<DepartureEditorFormProps>): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const createDeparture = useCreateDeparture();
  const createDraft = useCreateDraft();
  const [pendingAction, setPendingAction] = useState<'create' | 'draft' | null>(
    null
  );
  const [pendingBufferRequestId, setPendingBufferRequestId] = useState<
    string | null
  >(null);
  const handledBufferRequestIdRef = useRef<string | null>(null);
  const emptyValues = useMemo(() => createEmptyDepartureEditorValues(), []);
  const [arrivalSearch, setArrivalSearch] = useState('');
  const [debouncedArrivalSearch] = useDebouncedValue(arrivalSearch, 150);
  const bufferItemCount = useStore(bufferStore, (state) => state.items.length);
  const lastBufferApplyResult = useStore(
    bufferApplySessionStore,
    (state) => state.lastResult
  );

  const arrivals = useArrivalList({
    filters: {
      search: debouncedArrivalSearch,
      subjectKind: null,
      supplierId: null,
      productId: null,
      categoryId: null,
      hasCodes: null,
      occurredAt: {
        from: null,
        to: null,
      },
      createdAt: {
        from: null,
        to: null,
      },
      originKind: null,
    },
    sort: ARRIVAL_SELECT_SORT,
    limit: 100,
    offset: 0,
  });

  const initialValues = useMemo(
    () => ({
      ...emptyValues,
      ...(prefill
        ? {
            amount: prefill.amount,
            category: {
              createIfMissing: false,
              id: prefill.categoryId,
              name: prefill.categoryName,
            },
            codes: prefill.codes,
            product: {
              createIfMissing: false,
              id: prefill.productId,
              name: prefill.productName,
            },
            subjectKind: prefill.subjectKind,
            supplier: {
              createIfMissing: false,
              id: prefill.supplierId,
              name: prefill.supplierName,
            },
            title: prefill.title,
          }
        : {}),
    }),
    [prefill, emptyValues]
  );
  const { form, occurredAtValue, setOccurredAtValue } = useDepartureForm({
    initialValues,
  });
  const {
    openedSections,
    resolveErrorSection,
    scrollToSection,
    setOpenedSections,
  } = useDepartureSectionNavigation();

  const selectedArrivalId = form.values.basedOnArrivalId.trim();
  const linkedArrivalDetails = useArrivalDetails(
    selectedArrivalId === '' ? null : selectedArrivalId
  );
  const arrivalOptions = arrivals.map((arrival) => ({
    label: `${arrival.title} - ${arrival.occurredAt}`,
    value: arrival.id,
  }));

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
        appendCopiedBufferValuesToDepartureCodes(
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

  function showFormError(message: string): void {
    actionFeedback.notify({
      kind: 'error',
      message,
      title: 'Расход',
    });
  }

  function showFormSuccess(message: string): void {
    actionFeedback.notify({
      kind: 'success',
      message,
      title: 'Расход',
    });
  }

  function handleOpenBufferPicker(): void {
    const openResult = bufferApplyController.openPicker({
      requester: {
        kind: 'departure-form',
        context: {
          source: 'create',
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

    showFormError(DEPARTURE_EDITOR_COPY.operation.bufferUnavailable);
  }

  function handleOpenScanner(): void {
    const openResult = browserScannerRuntimeController.openSession({
      entrypoint: 'departure-form',
      context: {
        source: 'create',
      },
      activeTab: getPreferredScannerTab(),
    });

    if (
      openResult.code === 'opened' ||
      openResult.code === 'noop-already-open'
    ) {
      return;
    }

    showFormError(DEPARTURE_EDITOR_COPY.operation.scannerUnavailable);
  }

  function handleApplyLinkedArrival(): void {
    if (!linkedArrivalDetails) {
      return;
    }

    const nextValues = applyLinkedArrivalToDepartureValues(
      form.getValues(),
      linkedArrivalDetails
    );

    form.setValues(nextValues);
  }

  async function handleSaveDraft(): Promise<void> {
    const validation = form.validate();

    if (validation.hasErrors) {
      showFormError(DEPARTURE_EDITOR_COPY.operation.validationError);
      scrollToSection(resolveErrorSection(validation.errors));
      return;
    }

    setPendingAction('draft');

    try {
      const values = form.getValues();
      const result = await createDraft.execute({
        kind: 'departure',
        title: values.title.trim(),
        payload: buildDepartureDraftPayload(values),
      });

      if (!result.ok) {
        showFormError(
          result.code === 'VALIDATION_ERROR'
            ? DEPARTURE_EDITOR_COPY.operation.validationError
            : DEPARTURE_EDITOR_COPY.operation.draftFailed
        );
        return;
      }

      showFormSuccess('Расход сохранён в черновик.');
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
        const result = await createDeparture.execute(
          buildCreateDepartureInput(values)
        );

        if (!result.ok) {
          showFormError(
            result.code === 'VALIDATION_ERROR'
              ? DEPARTURE_EDITOR_COPY.operation.validationError
              : getCreateDepartureOperationMessage(result)
          );
          return;
        }

        showFormSuccess(DEPARTURE_EDITOR_COPY.created);
        onCreated(result.record);
      } finally {
        setPendingAction(null);
      }
    },
    (errors) => {
      showFormError(DEPARTURE_EDITOR_COPY.operation.validationError);
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
        <div id={DEPARTURE_FORM_SECTION_IDS.main}>
          <DepartureMainSection
            bufferItemCount={bufferItemCount}
            form={form}
            occurredAtValue={occurredAtValue}
            onOccurredAtChange={setOccurredAtValue}
            onOpenBufferPicker={handleOpenBufferPicker}
            onOpenScanner={handleOpenScanner}
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
          <div id={DEPARTURE_FORM_SECTION_IDS.directories}>
            <FormSectionAccordion
              helpKey="section.directories.departure"
              title="Справочники"
              value="directories"
            >
              <DepartureDirectoriesSection form={form} />
            </FormSectionAccordion>
          </div>

          <div id={DEPARTURE_FORM_SECTION_IDS.relation}>
            <FormSectionAccordion
              helpKey="section.relation.departure"
              title="Связь с приходом"
              value="relation"
            >
              <DepartureRelationSection
                arrivalOptions={arrivalOptions}
                linkedArrival={linkedArrivalDetails}
                onApplyLinkedArrival={handleApplyLinkedArrival}
                onClearLinkedArrival={() => {
                  form.setFieldValue('basedOnArrivalId', '');
                }}
                onSearchChange={setArrivalSearch}
                onSelectedArrivalChange={(value: string) => {
                  form.setFieldValue('basedOnArrivalId', value);
                }}
                selectedArrivalId={form.values.basedOnArrivalId}
              />
            </FormSectionAccordion>
          </div>

          <div id={DEPARTURE_FORM_SECTION_IDS.additional}>
            <FormSectionAccordion
              helpKey="section.additional.departure"
              title="Дополнительно"
              value="additional"
            >
              <DepartureAdditionalSection form={form} />
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
            Создать
          </Button>
        }
        secondaryAction={
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
        }
      >
        <Button
          {...formActionButtonPresets.cancel}
          onClick={onCancel}
          type="button"
        >
          Отмена
        </Button>
      </FormStickyActions>
    </form>
  );
}
