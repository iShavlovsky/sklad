import type { ReactElement } from 'react';
import { Stack, Text, ThemeIcon } from '@mantine/core';
import type { FileRejection } from '@mantine/dropzone';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

type FileDropzoneProps = {
  accept?: string[];
  active: boolean;
  description: string;
  maxSize?: number;
  title: string;
  onDragStateChange: (active: boolean) => void;
  onDrop: (files: File[]) => void;
  onReject?: (fileRejections: FileRejection[]) => void;
};

export function FileDropzone({
  accept,
  active,
  description,
  maxSize,
  title,
  onDragStateChange,
  onDrop,
  onReject,
}: Readonly<FileDropzoneProps>): ReactElement {
  return (
    <Dropzone
      activateOnClick
      accept={accept}
      className={`${styles.dropzone} scanner-photo-dropzone`}
      data-active={active || undefined}
      maxSize={maxSize}
      multiple={false}
      onDrop={(files) => {
        onDragStateChange(false);
        onDrop(files);
      }}
      onDragEnter={() => {
        onDragStateChange(true);
      }}
      onDragLeave={() => {
        onDragStateChange(false);
      }}
      onDragOver={() => {
        if (!active) {
          onDragStateChange(true);
        }
      }}
      onReject={(fileRejections) => {
        onDragStateChange(false);
        onReject?.(fileRejections);
      }}
    >
      <Stack align="center" className={styles.content} gap={6} justify="center">
        <Dropzone.Accept>
          <ThemeIcon color="teal" radius="xl" size={46} variant="light">
            <IconUpload size={24} stroke={1.8} />
          </ThemeIcon>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <ThemeIcon color="red" radius="xl" size={46} variant="light">
            <IconX size={24} stroke={1.8} />
          </ThemeIcon>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <ThemeIcon color="brand" radius="xl" size={46} variant="light">
            <IconPhoto size={24} stroke={1.8} />
          </ThemeIcon>
        </Dropzone.Idle>
        <Text fw={700} size="sm">
          {title}
        </Text>
        <Text c="dimmed" size="xs">
          {description}
        </Text>
      </Stack>
    </Dropzone>
  );
}
