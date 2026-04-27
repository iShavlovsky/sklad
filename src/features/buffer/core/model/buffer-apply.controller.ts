import {
  createBufferApplyAppliedResult,
  createBufferApplyCancelledResult,
} from './buffer-apply.result.ts';
import type {
  ApplySelectedBufferItemsResult,
  BufferApplyController,
  BufferApplyControllerDependencies,
  BufferApplyRequest,
  CancelBufferApplyRequestResult,
  OpenBufferApplyRequestInput,
  OpenBufferApplyRequestResult,
} from './buffer-apply.types.ts';
import type { BufferControlOwner } from './buffer-control.types.ts';

const BUFFER_PICKER_OVERLAY = {
  id: 'buffer-picker',
  kind: 'modal',
} as const;

function isBufferPickerOverlayActive(
  dependencies: BufferApplyControllerDependencies
): boolean {
  const { currentOverlay } = dependencies.overlayArbitrationStore.getState();

  return (
    currentOverlay?.id === BUFFER_PICKER_OVERLAY.id &&
    currentOverlay.kind === BUFFER_PICKER_OVERLAY.kind
  );
}

function getOpenRequest(
  dependencies: BufferApplyControllerDependencies
): BufferApplyRequest | null {
  const sessionState = dependencies.bufferApplySessionStore.getState();

  return sessionState.isOpen ? sessionState.currentRequest : null;
}

function createBufferControlOwner(
  request: Pick<BufferApplyRequest, 'requester'>
): BufferControlOwner {
  return {
    kind: request.requester.kind,
    ...(request.requester.context
      ? { context: request.requester.context }
      : { context: null }),
  };
}

function closePickerSession(
  dependencies: BufferApplyControllerDependencies
): boolean {
  const clearedPickerOverlay = isBufferPickerOverlayActive(dependencies);
  if (clearedPickerOverlay) {
    dependencies.overlayArbitrationStore.getState().closeCurrentOverlay();
  }

  dependencies.bufferApplySessionStore.getState().closeSession();

  return clearedPickerOverlay;
}

function deduplicateSelectedIds(selectedItemIds: string[]): string[] {
  return Array.from(new Set(selectedItemIds));
}

function releaseAcquiredControl(
  dependencies: BufferApplyControllerDependencies,
  request: Pick<BufferApplyRequest, 'requester'>
) {
  return dependencies.bufferControlController.releaseControl({
    owner: createBufferControlOwner(request),
  });
}

/** Coordinates buffer-picker request/result flow without letting overlay state own payloads. */
export function createBufferApplyController(
  dependencies: BufferApplyControllerDependencies
): BufferApplyController & {
  dependencies: BufferApplyControllerDependencies;
} {
  return {
    dependencies,
    openPicker: (
      input: OpenBufferApplyRequestInput
    ): OpenBufferApplyRequestResult => {
      const controlResult = dependencies.bufferControlController.acquireControl(
        {
          owner: {
            kind: input.requester.kind,
            ...(input.requester.context
              ? { context: input.requester.context }
              : { context: null }),
          },
          mode: 'apply',
        }
      );

      if (controlResult.code === 'lease-conflict') {
        return {
          code: 'control-conflict',
          controlResult,
        };
      }

      const overlayResult = dependencies.overlayArbitrationStore
        .getState()
        .openOverlay(BUFFER_PICKER_OVERLAY);

      if (overlayResult.code === 'conflict') {
        if (controlResult.code === 'acquired') {
          dependencies.bufferControlController.releaseControl({
            owner: {
              kind: input.requester.kind,
              ...(input.requester.context
                ? { context: input.requester.context }
                : { context: null }),
            },
          });
        }

        return {
          code: 'overlay-conflict',
          controlResult,
          overlayResult,
          overlay: BUFFER_PICKER_OVERLAY,
        };
      }

      if (
        overlayResult.code === 'noop-already-open' &&
        dependencies.bufferApplySessionStore.getState().isOpen
      ) {
        const { currentRequest } =
          dependencies.bufferApplySessionStore.getState();
        if (currentRequest === null) {
          throw new Error(
            'Buffer apply session is open without a current request.'
          );
        }

        return {
          code: 'noop-already-open',
          controlResult,
          overlayResult,
          request: currentRequest,
          overlay: BUFFER_PICKER_OVERLAY,
        };
      }

      const request = dependencies.bufferApplySessionStore
        .getState()
        .openSession(input);

      return {
        code: 'opened',
        controlResult,
        overlayResult,
        request,
        overlay: BUFFER_PICKER_OVERLAY,
      };
    },
    cancelPicker: (): CancelBufferApplyRequestResult => {
      const currentRequest = getOpenRequest(dependencies);
      if (currentRequest === null) {
        return {
          code: 'session-not-open',
        };
      }

      const result = createBufferApplyCancelledResult(currentRequest.requestId);
      dependencies.bufferApplySessionStore.getState().setLastResult(result);
      const clearedPickerOverlay = closePickerSession(dependencies);
      const controlReleaseResult = releaseAcquiredControl(
        dependencies,
        currentRequest
      );

      return {
        code: 'cancelled',
        controlReleaseResult,
        result,
        clearedPickerOverlay,
      };
    },
    applySelectedItems: ({
      selectedItemIds,
    }): ApplySelectedBufferItemsResult => {
      const currentRequest = getOpenRequest(dependencies);
      if (currentRequest === null) {
        return {
          code: 'session-not-open',
        };
      }

      if (!isBufferPickerOverlayActive(dependencies)) {
        return {
          code: 'picker-not-active',
        };
      }

      const uniqueSelectedItemIds = deduplicateSelectedIds(selectedItemIds);
      if (uniqueSelectedItemIds.length === 0) {
        return {
          code: 'selection-empty',
          request: currentRequest,
        };
      }

      if (
        currentRequest.selectionMode === 'single' &&
        uniqueSelectedItemIds.length !== 1
      ) {
        return {
          code: 'selection-mode-mismatch',
          request: currentRequest,
          selectedItemIds: uniqueSelectedItemIds,
        };
      }

      const bufferItems = dependencies.bufferStore.getState().items;
      const selectedItems = uniqueSelectedItemIds
        .map((selectedItemId) =>
          bufferItems.find((item) => item.id === selectedItemId)
        )
        .filter((item) => item !== undefined);
      const selectedItemIdSet = new Set(selectedItems.map((item) => item.id));
      const missingItemIds = uniqueSelectedItemIds.filter(
        (selectedItemId) => !selectedItemIdSet.has(selectedItemId)
      );

      if (missingItemIds.length > 0) {
        return {
          code: 'items-missing',
          request: currentRequest,
          missingItemIds,
        };
      }

      const result = createBufferApplyAppliedResult({
        requestId: currentRequest.requestId,
        selectedItems,
      });
      dependencies.bufferApplySessionStore.getState().setLastResult(result);
      const clearedPickerOverlay = closePickerSession(dependencies);
      const controlReleaseResult = releaseAcquiredControl(
        dependencies,
        currentRequest
      );

      return {
        code: 'applied',
        controlReleaseResult,
        result,
        clearedPickerOverlay,
      };
    },
    clearLastResult: () => {
      dependencies.bufferApplySessionStore.getState().clearLastResult();
    },
  };
}
