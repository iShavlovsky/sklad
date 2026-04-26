import type { ValidationErrorCode } from './validation-error-codes.ts';

export interface ValidationIssue {
  path: string;
  code: ValidationErrorCode;
  message: string;
}
