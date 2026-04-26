export interface SupplierRecord {
  id: string;
  name: string;
  normalizedName: string;
  note: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
