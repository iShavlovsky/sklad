import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'zustand';

import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import { useArrivalDetails } from '@/features/arrivals/data/hooks/use-arrival-details.ts';
import { useArrivalList } from '@/features/arrivals/data/hooks/use-arrival-list.ts';
import {
  bufferApplyController,
  bufferApplySessionStore,
  bufferStore,
} from '@/features/buffer/core/buffer-core.public.ts';
import { useCreateDeparture } from '@/features/departures/editor/hooks/use-create-departure.ts';
import { useCreateDraft } from '@/features/drafts/data/hooks/use-create-draft.ts';
import { openScannerSession } from '@/features/scanner/runtime/scanner-runtime.public.ts';
import type { StockDeparturePrefill } from '@/features/stocks/departure-prefill/stock-departure-prefill.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';

import { appendCopiedBufferValuesToDepartureCodes } from './model/departure-editor.buffer-apply.ts';
import { DEPARTURE_EDITOR_COPY } from './model/departure-editor.form-constants.ts';
import {
  applyLinkedArrivalToDepartureValues,
  buildCreateDepartureInput,
  buildDepartureDraftPayload,
  createEmptyDepartureEditorValues,
  getCreateDepartureOperationMessage,
} from './model/departure-editor.form-mappers.ts';
import { useDepartureForm } from './model/use-departure-form.ts';
import { useDepartureSectionNavigation } from './model/use-departure-section-navigation.ts';
import { DepartureEditorFormActions } from './departure-editor.actions.tsx';
import { DepartureEditorFormSections } from './departure-editor.sections.tsx';

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
            quantity: prefill.amount,
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
      title: 'Отгрузка',
    });
  }

  function showFormSuccess(message: string): void {
    actionFeedback.notify({
      kind: 'success',
      message,
      title: 'Отгрузка',
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
    const openResult = openScannerSession({
      entrypoint: 'departure-form',
      context: {
        source: 'create',
      },
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

      showFormSuccess('Отгрузка сохранена в черновик.');
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
      <DepartureEditorFormSections
        arrivalOptions={arrivalOptions}
        bufferItemCount={bufferItemCount}
        form={form}
        linkedArrivalDetails={linkedArrivalDetails}
        occurredAtValue={occurredAtValue}
        openedSections={openedSections}
        selectedArrivalId={form.values.basedOnArrivalId}
        onApplyLinkedArrival={handleApplyLinkedArrival}
        onClearLinkedArrival={() => {
          form.setFieldValue('basedOnArrivalId', '');
        }}
        onOccurredAtChange={setOccurredAtValue}
        onOpenBufferPicker={handleOpenBufferPicker}
        onOpenScanner={handleOpenScanner}
        onOpenedSectionsChange={setOpenedSections}
        onSearchChange={setArrivalSearch}
        onSelectedArrivalChange={(value: string) => {
          form.setFieldValue('basedOnArrivalId', value);
        }}
      />

      <DepartureEditorFormActions
        pendingAction={pendingAction}
        onCancel={onCancel}
        onSaveDraft={() => {
          void handleSaveDraft();
        }}
      />
    </form>
  );
}
