import { BarcodeFormat, DecodeHintType } from '@zxing/library';

import type { ScannerDecodeHints } from '../contracts/contracts.ts';

export const ZXING_SUPPORTED_FORMATS = [
  BarcodeFormat.AZTEC,
  BarcodeFormat.CODABAR,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODE_128,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.EAN_8,
  BarcodeFormat.EAN_13,
  BarcodeFormat.ITF,
  BarcodeFormat.PDF_417,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.RSS_14,
  BarcodeFormat.RSS_EXPANDED,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
] as const satisfies readonly BarcodeFormat[];

const ZXING_FORMAT_ALIASES = new Map<string, BarcodeFormat>([
  ['aztec', BarcodeFormat.AZTEC],
  ['codabar', BarcodeFormat.CODABAR],
  ['code39', BarcodeFormat.CODE_39],
  ['code_39', BarcodeFormat.CODE_39],
  ['code-39', BarcodeFormat.CODE_39],
  ['code93', BarcodeFormat.CODE_93],
  ['code_93', BarcodeFormat.CODE_93],
  ['code-93', BarcodeFormat.CODE_93],
  ['code128', BarcodeFormat.CODE_128],
  ['code_128', BarcodeFormat.CODE_128],
  ['code-128', BarcodeFormat.CODE_128],
  ['data_matrix', BarcodeFormat.DATA_MATRIX],
  ['data-matrix', BarcodeFormat.DATA_MATRIX],
  ['datamatrix', BarcodeFormat.DATA_MATRIX],
  ['ean8', BarcodeFormat.EAN_8],
  ['ean_8', BarcodeFormat.EAN_8],
  ['ean-8', BarcodeFormat.EAN_8],
  ['ean13', BarcodeFormat.EAN_13],
  ['ean_13', BarcodeFormat.EAN_13],
  ['ean-13', BarcodeFormat.EAN_13],
  ['itf', BarcodeFormat.ITF],
  ['pdf417', BarcodeFormat.PDF_417],
  ['pdf_417', BarcodeFormat.PDF_417],
  ['pdf-417', BarcodeFormat.PDF_417],
  ['qr', BarcodeFormat.QR_CODE],
  ['qrcode', BarcodeFormat.QR_CODE],
  ['qr_code', BarcodeFormat.QR_CODE],
  ['qr-code', BarcodeFormat.QR_CODE],
  ['rss14', BarcodeFormat.RSS_14],
  ['rss_14', BarcodeFormat.RSS_14],
  ['rss-14', BarcodeFormat.RSS_14],
  ['rssexpanded', BarcodeFormat.RSS_EXPANDED],
  ['rss_expanded', BarcodeFormat.RSS_EXPANDED],
  ['rss-expanded', BarcodeFormat.RSS_EXPANDED],
  ['upca', BarcodeFormat.UPC_A],
  ['upc_a', BarcodeFormat.UPC_A],
  ['upc-a', BarcodeFormat.UPC_A],
  ['upce', BarcodeFormat.UPC_E],
  ['upc_e', BarcodeFormat.UPC_E],
  ['upc-e', BarcodeFormat.UPC_E],
]);

function normalizeFormatName(format: string): string {
  return format
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_');
}

export function resolveZxingFormats(
  formats?: readonly string[] | null
): BarcodeFormat[] {
  if (formats === undefined || formats === null || formats.length === 0) {
    return [...ZXING_SUPPORTED_FORMATS];
  }

  const resolved = new Set<BarcodeFormat>();
  for (const format of formats) {
    const normalized = normalizeFormatName(format);
    const barcodeFormat = ZXING_FORMAT_ALIASES.get(normalized);

    if (barcodeFormat !== undefined) {
      resolved.add(barcodeFormat);
    }
  }

  return resolved.size > 0 ? [...resolved] : [...ZXING_SUPPORTED_FORMATS];
}

export function createZxingDecodeHints(
  decodeHints?: ScannerDecodeHints | null
): Map<DecodeHintType, unknown> {
  const hints = new Map<DecodeHintType, unknown>();

  hints.set(
    DecodeHintType.POSSIBLE_FORMATS,
    resolveZxingFormats(decodeHints?.formats)
  );

  if (decodeHints?.tryHarder === true) {
    hints.set(DecodeHintType.TRY_HARDER, true);
  }

  return hints;
}

export function formatBarcodeFormatName(
  format: BarcodeFormat | null | undefined
): string | null {
  if (format === null || format === undefined) {
    return null;
  }

  return BarcodeFormat[format] ?? null;
}
