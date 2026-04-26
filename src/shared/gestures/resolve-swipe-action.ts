import type {
  ResolveSwipeActionInput,
  SwipeDirection,
  SwipeResolution,
} from '@/shared/gestures/types';

function getDirection(offsetX: number): SwipeDirection | null {
  if (offsetX === 0) return null;
  return offsetX > 0 ? 'right' : 'left';
}

export function resolveSwipeAction(
  input: ResolveSwipeActionInput
): SwipeResolution {
  if (!input.enabled) {
    return {
      kind: 'ignored',
      reason: 'disabled',
    };
  }

  const direction = getDirection(input.offsetX);
  if (!direction) {
    return {
      kind: 'ignored',
      reason: 'missing-direction',
    };
  }

  if (Math.abs(input.offsetY) > input.maxCrossAxisOffset) {
    return {
      kind: 'ignored',
      reason: 'cross-axis',
    };
  }

  if (input.swipeX !== 0) {
    return {
      kind: 'triggered',
      direction,
      reason: 'gesture-swipe',
    };
  }

  if (Math.abs(input.offsetX) >= input.threshold) {
    return {
      kind: 'triggered',
      direction,
      reason: 'distance',
    };
  }

  if (Math.abs(input.velocityX) >= input.minVelocity) {
    return {
      kind: 'triggered',
      direction,
      reason: 'velocity',
    };
  }

  return {
    kind: 'ignored',
    reason: 'below-threshold',
  };
}
