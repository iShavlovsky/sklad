import type { ReactElement, ReactNode } from 'react';
import { clamp, useMove } from '@mantine/hooks';

import styles from './styles.module.css';

type HorizontalSliderProps = {
  icon?: ReactNode;
  label?: string;
  title?: string;
  value: number;
  valueText?: string;
  onChange: (value: number) => void;
};

export function HorizontalSlider({
  icon,
  label,
  title,
  value,
  valueText,
  onChange,
}: Readonly<HorizontalSliderProps>): ReactElement {
  const normalizedValue = clamp(value, 0, 1);
  const { active, ref } = useMove(({ x }) => {
    onChange(clamp(x, 0, 1));
  });
  const displayValue = valueText ?? `${Math.round(normalizedValue * 100)}`;
  const inverseDisplayValue = `${Math.round((1 - normalizedValue) * 100)}`;
  const sliderTitle = title ?? label ?? null;
  const leftFlex = Math.max(normalizedValue, 0.0001);
  const rightFlex = Math.max(1 - normalizedValue, 0.0001);

  return (
    <div className={`${styles.slider} horizontal-slider`}>
      <div className={`${styles.track} horizontal-slider__track`} ref={ref}>
        {sliderTitle && (
          <div className={`${styles.title} horizontal-slider__title`}>
            {icon && (
              <span
                aria-hidden="true"
                className={`${styles.titleIcon} horizontal-slider__title-icon`}
              >
                {icon}
              </span>
            )}
            <span
              className={`${styles.titleText} horizontal-slider__title-text`}
            >
              {sliderTitle}
            </span>
          </div>
        )}
        <div
          className={`${styles.segment} ${styles.segmentFilled} horizontal-slider__segment horizontal-slider__segment--filled`}
          style={{ flexBasis: 0, flexGrow: leftFlex }}
        >
          <span
            className={`${styles.segmentValue} horizontal-slider__segment-value`}
          >
            {displayValue}
          </span>
        </div>
        <div
          className={`${styles.thumb} horizontal-slider__thumb`}
          data-active={active || undefined}
        >
          <span
            aria-hidden="true"
            className={`${styles.thumbGrip} horizontal-slider__thumb-grip`}
          >
            :::
          </span>
        </div>
        <div
          className={`${styles.segment} ${styles.segmentEmpty} horizontal-slider__segment horizontal-slider__segment--empty`}
          style={{ flexBasis: 0, flexGrow: rightFlex }}
        >
          <span
            className={`${styles.segmentValue} ${styles.segmentValueEnd} horizontal-slider__segment-value horizontal-slider__segment-value--end`}
          >
            {inverseDisplayValue}
          </span>
        </div>
      </div>
    </div>
  );
}
