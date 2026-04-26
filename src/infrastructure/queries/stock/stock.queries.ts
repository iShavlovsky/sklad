import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import {
  compareIsoDate,
  compareNullableNumber,
  compareNullableString,
  containsNormalizedText,
  normalizeSearch,
  paginate,
} from '@/domain/common/query-helpers';
import type { RecordCodeOwnerKind } from '@/domain/common/record-kinds.ts';
import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';
import type {
  StockListQuery,
  StockListSort,
} from '@/domain/queries/stock/stock-list.query.ts';
import type { AppDb } from '@/infrastructure/db/app-db';

interface StockMovement {
  id: string;
  amount: number | null;
  subjectKind: ArrivalRecord['subjectKind'];
  title: string;
  supplierId: string | null;
  supplierName: string | null;
  productId: string | null;
  productName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  updatedAt: string;
}

interface StockAccumulator extends StockMovement {
  id: string;
  arrivalCount: number;
  departureCount: number;
  balance: number;
  codeBalanceByValue: Map<string, number>;
}

export class StockQueries {
  private readonly db: AppDb;

  public constructor(db: AppDb) {
    this.db = db;
  }

  public async list(query: StockListQuery): Promise<StockListItem[]> {
    const [arrivals, departures, recordCodes] = await Promise.all([
      this.db.arrivals.toArray(),
      this.db.departures.toArray(),
      this.db.recordCodes.toArray(),
    ]);

    const rows = this.projectRows(arrivals, departures, recordCodes);
    const normalizedSearch = normalizeSearch(query.filters.search);

    const filtered = rows
      .filter((row) =>
        this.matchesListFilters(row, query.filters, normalizedSearch)
      )
      .sort((left, right) => this.compareListItems(left, right, query.sort));

    return paginate(filtered, query.offset, query.limit);
  }

  private projectRows(
    arrivals: ArrivalRecord[],
    departures: DepartureRecord[],
    recordCodes: RecordCodeRecord[]
  ): StockListItem[] {
    const groups = new Map<string, StockAccumulator>();
    const codeCountsByOwner = this.createCodeCountsByOwner(recordCodes);
    const codeValuesByOwner = this.createCodeValuesByOwner(recordCodes);

    for (const arrival of arrivals) {
      this.mergeMovement(
        groups,
        arrival,
        1,
        this.resolveMovementUnits(arrival, 'arrival', codeCountsByOwner),
        this.resolveMovementCodes(arrival, 'arrival', codeValuesByOwner)
      );
    }

    for (const departure of departures) {
      this.mergeMovement(
        groups,
        departure,
        -1,
        this.resolveMovementUnits(departure, 'departure', codeCountsByOwner),
        this.resolveMovementCodes(departure, 'departure', codeValuesByOwner)
      );
    }

    return [...groups.values()].map((group) => ({
      id: group.id,
      title: group.title,
      subjectKind: group.subjectKind,
      supplierId: group.supplierId,
      supplierName: group.supplierName,
      productId: group.productId,
      productName: group.productName,
      categoryId: group.categoryId,
      categoryName: group.categoryName,
      arrivalCount: group.arrivalCount,
      departureCount: group.departureCount,
      balance: group.balance,
      availableCodes: [...group.codeBalanceByValue.entries()]
        .filter(([, count]) => count > 0)
        .map(([value]) => value)
        .sort((left, right) => left.localeCompare(right)),
      updatedAt: group.updatedAt,
    }));
  }

  private createCodeCountsByOwner(
    recordCodes: RecordCodeRecord[]
  ): Map<string, number> {
    const counts = new Map<string, number>();

    for (const code of recordCodes) {
      const ownerKey = this.createOwnerKey(code.ownerKind, code.ownerId);
      counts.set(ownerKey, (counts.get(ownerKey) ?? 0) + 1);
    }

    return counts;
  }

  private createCodeValuesByOwner(
    recordCodes: RecordCodeRecord[]
  ): Map<string, string[]> {
    const valuesByOwner = new Map<string, string[]>();

    for (const code of recordCodes) {
      const ownerKey = this.createOwnerKey(code.ownerKind, code.ownerId);
      const current = valuesByOwner.get(ownerKey) ?? [];
      current.push(code.value);
      valuesByOwner.set(ownerKey, current);
    }

    return valuesByOwner;
  }

  private mergeMovement(
    groups: Map<string, StockAccumulator>,
    movement: StockMovement,
    delta: 1 | -1,
    units: number,
    codes: string[]
  ): void {
    const id = this.createGroupId(movement);
    const current =
      groups.get(id) ??
      ({
        id,
        amount: movement.amount,
        title: movement.title,
        subjectKind: movement.subjectKind,
        supplierId: movement.supplierId,
        supplierName: movement.supplierName,
        productId: movement.productId,
        productName: movement.productName,
        categoryId: movement.categoryId,
        categoryName: movement.categoryName,
        arrivalCount: 0,
        departureCount: 0,
        balance: 0,
        codeBalanceByValue: new Map<string, number>(),
        updatedAt: movement.updatedAt,
      } satisfies StockAccumulator);

    if (movement.updatedAt >= current.updatedAt) {
      current.title = movement.title;
      current.updatedAt = movement.updatedAt;
    }

    if (delta > 0) {
      current.arrivalCount += units;
    } else {
      current.departureCount += units;
    }

    current.balance = current.arrivalCount - current.departureCount;

    for (const code of codes) {
      current.codeBalanceByValue.set(
        code,
        (current.codeBalanceByValue.get(code) ?? 0) + delta
      );
    }

    groups.set(id, current);
  }

  private resolveMovementUnits(
    movement: StockMovement,
    ownerKind: 'arrival' | 'departure',
    codeCountsByOwner: Map<string, number>
  ): number {
    const codeUnits =
      codeCountsByOwner.get(this.createOwnerKey(ownerKind, movement.id)) ?? 0;

    if (codeUnits > 0) {
      return codeUnits;
    }

    if (
      movement.amount !== null &&
      Number.isFinite(movement.amount) &&
      movement.amount > 0
    ) {
      return movement.amount;
    }

    return 1;
  }

  private resolveMovementCodes(
    movement: StockMovement,
    ownerKind: 'arrival' | 'departure',
    codeValuesByOwner: Map<string, string[]>
  ): string[] {
    return (
      codeValuesByOwner.get(this.createOwnerKey(ownerKind, movement.id)) ?? []
    );
  }

  private createGroupId(movement: StockMovement): string {
    return JSON.stringify([
      movement.subjectKind,
      movement.supplierId,
      movement.supplierName,
      movement.productId,
      movement.productName,
      movement.categoryId,
      movement.categoryName,
    ]);
  }

  private createOwnerKey(
    ownerKind: RecordCodeOwnerKind,
    ownerId: string
  ): string {
    return `${ownerKind}:${ownerId}`;
  }

  private matchesListFilters(
    row: StockListItem,
    filters: StockListQuery['filters'],
    normalizedSearch: string
  ): boolean {
    if (
      filters.subjectKind !== null &&
      row.subjectKind !== filters.subjectKind
    ) {
      return false;
    }

    if (filters.supplierId !== null && row.supplierId !== filters.supplierId) {
      return false;
    }

    if (filters.productId !== null && row.productId !== filters.productId) {
      return false;
    }

    if (filters.categoryId !== null && row.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.inStockOnly && row.balance <= 0) {
      return false;
    }

    return containsNormalizedText(
      [row.title, row.supplierName, row.productName, row.categoryName],
      normalizedSearch
    );
  }

  private compareListItems(
    left: StockListItem,
    right: StockListItem,
    sort: StockListSort
  ): number {
    let result = 0;

    switch (sort.field) {
      case 'title':
        result = compareNullableString(left.title, right.title, sort.direction);
        break;
      case 'supplierName':
        result = compareNullableString(
          left.supplierName,
          right.supplierName,
          sort.direction
        );
        break;
      case 'productName':
        result = compareNullableString(
          left.productName,
          right.productName,
          sort.direction
        );
        break;
      case 'categoryName':
        result = compareNullableString(
          left.categoryName,
          right.categoryName,
          sort.direction
        );
        break;
      case 'balance':
        result = compareNullableNumber(
          left.balance,
          right.balance,
          sort.direction
        );
        break;
      case 'updatedAt':
        result = compareIsoDate(
          left.updatedAt,
          right.updatedAt,
          sort.direction
        );
        break;
    }

    if (result !== 0) {
      return result;
    }

    return compareNullableString(left.id, right.id, 'asc');
  }
}
