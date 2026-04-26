import type { DragState, UserDragConfig } from '@use-gesture/core/types';
import type { useDrag } from '@use-gesture/react';

export type SwipeDirection = 'left' | 'right';

export type SwipeTriggerReason = 'distance' | 'velocity' | 'gesture-swipe';

export type SwipeResolution =
  | {
      kind: 'triggered';
      direction: SwipeDirection;
      reason: SwipeTriggerReason;
    }
  | {
      kind: 'ignored';
      reason:
        | 'disabled'
        | 'cross-axis'
        | 'below-threshold'
        | 'missing-direction';
    };

export type SwipeGestureSnapshot = {
  phase: 'idle' | 'dragging' | 'completed' | 'canceled';
  direction: SwipeDirection | null;
  offsetX: number;
  offsetY: number;
  absoluteOffsetX: number;
  progress: number;
  velocityX: number;
  isActive: boolean;
};

export type SwipeActionContext = {
  direction: SwipeDirection;
  reason: SwipeTriggerReason;
  snapshot: SwipeGestureSnapshot;
  state: DragState;
};

export type SwipeActionHandler = (context: SwipeActionContext) => void;

export type SwipeCancelContext = {
  snapshot: SwipeGestureSnapshot;
  state: DragState;
  reason: Exclude<SwipeResolution, { kind: 'triggered' }>['reason'];
};

export type SwipeActionHandlers = Partial<
  Record<SwipeDirection, SwipeActionHandler>
>;

export type SwipeActionConfig = {
  enabled?: boolean;
  threshold?: number;
  minVelocity?: number;
  maxCrossAxisOffset?: number;
  rubberband?: UserDragConfig['rubberband'];
  preventScroll?: UserDragConfig['preventScroll'];
  preventDefault?: boolean;
  pointer?: UserDragConfig['pointer'];
  eventOptions?: UserDragConfig['eventOptions'];
  filterTaps?: boolean;
  onSwipe?: SwipeActionHandler;
  onCancel?: (context: SwipeCancelContext) => void;
  actions?: SwipeActionHandlers;
};

export type SwipeBind = Exclude<ReturnType<typeof useDrag>, void>;

export type UseSwipeActionsResult = {
  bind: SwipeBind;
  state: SwipeGestureSnapshot;
  reset(): void;
};

export type ResolveSwipeActionInput = {
  enabled: boolean;
  threshold: number;
  minVelocity: number;
  maxCrossAxisOffset: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  swipeX: number;
};
