import type {
  BufferControlLease,
  BufferControlOwner,
} from './buffer-control.types.ts';

export function isSameBufferControlOwner(
  left: BufferControlOwner,
  right: BufferControlOwner
): boolean {
  return (
    left.kind === right.kind &&
    (left.context?.recordId ?? null) === (right.context?.recordId ?? null) &&
    (left.context?.source ?? null) === (right.context?.source ?? null)
  );
}

export function isSameBufferControlLease(
  left: BufferControlLease,
  right: BufferControlLease
): boolean {
  return (
    left.mode === right.mode &&
    isSameBufferControlOwner(left.owner, right.owner)
  );
}
