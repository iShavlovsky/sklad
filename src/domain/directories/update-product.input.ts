export interface UpdateProductInput {
  id: string;
  name: string;
  supplierId: string | null;
  categoryId: string | null;
  note: string | null;
  isArchived: boolean;
}
