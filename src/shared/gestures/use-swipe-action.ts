import { useDrag } from '@use-gesture/react';

import type { SwipeDirection } from './swipe.types';

type UseSwipeActionInput = {
  enabled?: boolean;
  minDistance?: number;
  minVelocity?: number;
  onSwipe: (direction: SwipeDirection) => void;
};

type SwipeGestureBind = ReturnType<typeof useDrag>;

export function useSwipeAction({
  enabled = true,
  minDistance = 48,
  minVelocity = 0.2,
  onSwipe,
}: Readonly<UseSwipeActionInput>): {
  bind: SwipeGestureBind;
  touchAction: 'pan-y';
} {
  const bind = useDrag(
    ({
      last,
      movement: [movementX, movementY],
      velocity: [velocityX, velocityY],
    }) => {
      if (!enabled || !last) {
        return;
      }

      const absoluteX = Math.abs(movementX);
      const absoluteY = Math.abs(movementY);

      if (absoluteX >= absoluteY) {
        if (absoluteX < minDistance || velocityX < minVelocity) {
          return;
        }

        onSwipe(movementX > 0 ? 'right' : 'left');
        return;
      }

      if (absoluteY < minDistance || velocityY < minVelocity) {
        return;
      }

      onSwipe(movementY > 0 ? 'down' : 'up');
    },
    {
      filterTaps: true,
    }
  );

  return {
    bind,
    touchAction: 'pan-y',
  };
}
