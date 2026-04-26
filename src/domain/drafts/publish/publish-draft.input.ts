export type DraftPublishTargetKind = 'arrival' | 'departure';

export interface PublishDraftInput {
  id: string;
  targetKind: DraftPublishTargetKind;
}
