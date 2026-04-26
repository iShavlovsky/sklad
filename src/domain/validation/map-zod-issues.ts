import type { z } from 'zod';

import type { ValidationErrorCode } from '@/domain/validation/validation-error-codes.ts';
import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

function toValidationErrorCode(code: string): ValidationErrorCode {
  switch (code) {
    case 'invalid_type':
      return 'invalid_type';
    case 'invalid_format':
      return 'invalid_format';
    case 'invalid_value':
      return 'invalid_value';
    case 'too_small':
      return 'too_small';
    case 'too_big':
      return 'too_big';
    case 'custom':
      return 'custom';
    default:
      return 'unknown';
  }
}

export function mapZodIssues(
  issues: readonly z.core.$ZodIssue[]
): ValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    code: toValidationErrorCode(issue.code),
    message: issue.message,
  }));
}
