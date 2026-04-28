import { type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';

import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import { DepartureEditorForm } from '@/features/departures/editor/form/departure-editor.form.tsx';
import type { StockDeparturePrefillState } from '@/features/stocks/departure-prefill/stock-departure-prefill.ts';
import { useAppNavigate } from '@/router';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';

type DepartureSuccessState = {
  departureCreated?: {
    message: string;
    recordId: string;
  };
};

export function DepartureCreatePage(): ReactElement {
  const navigate = useAppNavigate();
  const location = useLocation();
  const stockPrefill =
    typeof location.state === 'object' &&
    location.state !== null &&
    'stockDeparturePrefill' in location.state &&
    typeof location.state.stockDeparturePrefill === 'object' &&
    location.state.stockDeparturePrefill !== null
      ? (location.state as StockDeparturePrefillState).stockDeparturePrefill
      : undefined;

  function handleCreated(record: DepartureRecord): void {
    navigate.to('root.departures', {
      replace: true,
      state: {
        departureCreated: {
          message: 'Отгрузка создана.',
          recordId: record.id,
        },
      } satisfies DepartureSuccessState,
    });
  }

  return (
    <PageContainer scrollable={false}>
      <SectionStack fillHeight>
        <section style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          <DepartureEditorForm
            onCancel={() => navigate.to('root.departures')}
            onCreated={handleCreated}
            prefill={stockPrefill}
          />
        </section>
      </SectionStack>
      <BottomSpacer compact />
    </PageContainer>
  );
}
