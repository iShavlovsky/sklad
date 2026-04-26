import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import type { DragState } from '@use-gesture/core/types';
import { useDrag } from '@use-gesture/react';

import { resolveSwipeAction } from '@/shared/gestures/resolve-swipe-action';
import type {
  SwipeActionConfig,
  SwipeActionContext,
  SwipeBind,
  SwipeGestureSnapshot,
  UseSwipeActionsResult,
} from '@/shared/gestures/types';

const DEFAULT_SWIPE_THRESHOLD = 56;
const DEFAULT_SWIPE_MIN_VELOCITY = 0.35;
const DEFAULT_MAX_CROSS_AXIS_OFFSET = 32;

export const INITIAL_SWIPE_GESTURE_STATE: SwipeGestureSnapshot = {
  phase: 'idle',
  direction: null,
  offsetX: 0,
  offsetY: 0,
  absoluteOffsetX: 0,
  progress: 0,
  velocityX: 0,
  isActive: false,
};

function createSnapshot(
  state: DragState,
  threshold: number,
  phase: SwipeGestureSnapshot['phase']
): SwipeGestureSnapshot {
  const [offsetX, offsetY] = state.offset;
  const [velocityX] = state.velocity;
  const direction = offsetX === 0 ? null : offsetX > 0 ? 'right' : 'left';
  const absoluteOffsetX = Math.abs(offsetX);

  return {
    phase,
    direction,
    offsetX,
    offsetY,
    absoluteOffsetX,
    progress: Math.min(1, absoluteOffsetX / threshold),
    velocityX,
    isActive: state.active,
  };
}

function areSnapshotsEqual(
  current: SwipeGestureSnapshot,
  next: SwipeGestureSnapshot
): boolean {
  return (
    current.phase === next.phase &&
    current.direction === next.direction &&
    current.offsetX === next.offsetX &&
    current.offsetY === next.offsetY &&
    current.absoluteOffsetX === next.absoluteOffsetX &&
    current.progress === next.progress &&
    current.velocityX === next.velocityX &&
    current.isActive === next.isActive
  );
}

function updateSnapshot(
  setSnapshot: Dispatch<SetStateAction<SwipeGestureSnapshot>>,
  nextSnapshot: SwipeGestureSnapshot
): void {
  setSnapshot((current) =>
    areSnapshotsEqual(current, nextSnapshot) ? current : nextSnapshot
  );
}

export function useSwipeActions(
  config: SwipeActionConfig = {}
): UseSwipeActionsResult {
  const [snapshot, setSnapshot] = useState(INITIAL_SWIPE_GESTURE_STATE);

  const threshold = config.threshold ?? DEFAULT_SWIPE_THRESHOLD;
  const minVelocity = config.minVelocity ?? DEFAULT_SWIPE_MIN_VELOCITY;
  const maxCrossAxisOffset =
    config.maxCrossAxisOffset ?? DEFAULT_MAX_CROSS_AXIS_OFFSET;

  const bind = useDrag(
    (state) => {
      const draggingSnapshot = createSnapshot(state, threshold, 'dragging');

      if (!state.last) {
        updateSnapshot(setSnapshot, draggingSnapshot);
        return;
      }

      const resolution = resolveSwipeAction({
        enabled: config.enabled !== false,
        threshold,
        minVelocity,
        maxCrossAxisOffset,
        offsetX: draggingSnapshot.offsetX,
        offsetY: draggingSnapshot.offsetY,
        velocityX: draggingSnapshot.velocityX,
        swipeX: state.swipe[0],
      });

      if (resolution.kind === 'triggered') {
        const completedSnapshot = {
          ...draggingSnapshot,
          phase: 'completed' as const,
          isActive: false,
        };
        const context: SwipeActionContext = {
          direction: resolution.direction,
          reason: resolution.reason,
          snapshot: completedSnapshot,
          state,
        };

        config.actions?.[resolution.direction]?.(context);
        config.onSwipe?.(context);
        updateSnapshot(setSnapshot, completedSnapshot);
        return;
      }

      const canceledSnapshot = {
        ...draggingSnapshot,
        phase: 'canceled' as const,
        isActive: false,
      };

      config.onCancel?.({
        snapshot: canceledSnapshot,
        state,
        reason: resolution.reason,
      });
      updateSnapshot(setSnapshot, canceledSnapshot);
    },
    {
      axis: 'x',
      filterTaps: config.filterTaps ?? true,
      pointer: config.pointer,
      preventDefault: config.preventDefault ?? false,
      preventScroll: config.preventScroll ?? false,
      rubberband: config.rubberband ?? false,
      eventOptions: config.eventOptions,
      swipe: {
        distance: [threshold, Number.POSITIVE_INFINITY],
        velocity: [minVelocity, Number.POSITIVE_INFINITY],
      },
      threshold: [8, Number.POSITIVE_INFINITY],
      enabled: config.enabled ?? true,
    }
  ) as SwipeBind;

  return {
    bind,
    state: snapshot,
    reset() {
      setSnapshot(INITIAL_SWIPE_GESTURE_STATE);
    },
  };
}
