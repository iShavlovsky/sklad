import { useStocksPageViewState } from './use-stocks-page-view-state.ts';
import { useStocksPageWorkflow } from './use-stocks-page-workflow.ts';

export function useStocksPageState() {
  const viewState = useStocksPageViewState();
  const workflowState = useStocksPageWorkflow({
    stocks: viewState.stocks,
  });

  return {
    ...viewState,
    ...workflowState,
  };
}

export type StocksPageState = ReturnType<typeof useStocksPageState>;
