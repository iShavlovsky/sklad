import type { HTMLAttributes } from 'react';
import { useRef } from 'react';

type PointerPoint = {
  x: number;
  y: number;
};

type UsePressAndHoldGestureInput = {
  delayMs?: number;
  enabled?: boolean;
  moveTolerance?: number;
  onHold: () => void;
};

type PressAndHoldBind = Pick<
  HTMLAttributes<HTMLElement>,
  | 'onPointerCancelCapture'
  | 'onPointerDownCapture'
  | 'onPointerMoveCapture'
  | 'onPointerUpCapture'
>;

export function usePressAndHoldGesture({
  delayMs = 160,
  enabled = true,
  moveTolerance = 10,
  onHold,
}: Readonly<UsePressAndHoldGestureInput>): {
  bind: PressAndHoldBind;
  touchAction: 'none';
} {
  const holdTimerRef = useRef<number | null>(null);
  const originRef = useRef<PointerPoint | null>(null);
  const hasTriggeredRef = useRef(false);

  const clearHold = (): void => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const reset = (): void => {
    clearHold();
    originRef.current = null;
    hasTriggeredRef.current = false;
  };

  return {
    bind: {
      onPointerDownCapture: (event) => {
        reset();

        if (!enabled || event.pointerType !== 'touch') {
          return;
        }

        originRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        holdTimerRef.current = window.setTimeout(() => {
          hasTriggeredRef.current = true;
          onHold();
        }, delayMs);
      },
      onPointerMoveCapture: (event) => {
        if (
          !enabled ||
          event.pointerType !== 'touch' ||
          originRef.current === null ||
          hasTriggeredRef.current
        ) {
          return;
        }

        const deltaX = Math.abs(event.clientX - originRef.current.x);
        const deltaY = Math.abs(event.clientY - originRef.current.y);

        if (deltaX > moveTolerance || deltaY > moveTolerance) {
          clearHold();
        }
      },
      onPointerUpCapture: () => {
        reset();
      },
      onPointerCancelCapture: () => {
        reset();
      },
    },
    touchAction: 'none',
  };
}
