export interface ProductRecord {
  id: string;
  name: string;
  normalizedName: string;
  supplierId: string | null;
  categoryId: string | null;
  note: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
