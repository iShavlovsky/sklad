export interface MoneyValue {
  amount: number | null;
  currency: string | null;
}

export interface DirectoryRefSnapshot {
  id: string | null;
  name: string | null;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}
