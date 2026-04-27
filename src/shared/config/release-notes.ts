export type ReleaseNotes = {
  changes: readonly string[];
  title: string;
  version: string;
};

export const currentReleaseNotes = {
  changes: [
    'PWA-баннер показывает краткие изменения новой версии до перезагрузки.',
    'Список изменений публикуется как отдельный JSON для установленного клиента.',
    'Версия приложения обновлена до 0.1.0-beta.2.',
  ],
  title: 'Краткие изменения обновления',
  version: '0.1.0-beta.2',
} as const satisfies ReleaseNotes;
