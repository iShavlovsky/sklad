import { createId } from '@/shared/utils/create-id.ts';

import type { BackupCheckpointInput } from './backup-checkpoint.input.ts';
import type { BackupCheckpointOutput } from './backup-checkpoint.result.ts';

export class BackupCheckpointService {
  public execute(input: BackupCheckpointInput): BackupCheckpointOutput {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const checkpointRecord = {
      id: createId(),
      label: input.label,
      snapshot: input.snapshot,
      createdAt,
    };

    return {
      checkpointRecord,
      report: {
        action: 'checkpoint',
        status: 'success',
        label: input.label,
        createdAt,
        summary: `Checkpoint captured for ${input.label}`,
        details: JSON.stringify({
          checkpointId: checkpointRecord.id,
          label: input.label,
          createdAt,
          payloadVersion: input.snapshot.version,
        }),
      },
    };
  }
}
