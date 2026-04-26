import { type ReactElement, type ReactNode, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconExclamationCircle,
  IconShieldCheck,
} from '@tabler/icons-react';

import type { HapticPattern } from '@/shared/haptics';
import { useHaptics } from '@/shared/haptics';

export type ActionFeedbackKind = 'success' | 'warning' | 'error' | 'confirm';

export interface ActionFeedbackInput {
  autoClose?: number | false;
  id?: string;
  kind: ActionFeedbackKind;
  message: ReactNode;
  title: ReactNode;
}

export interface ActionFeedbackApi {
  notify: (input: ActionFeedbackInput) => void;
}

const FEEDBACK_CONFIG: Record<
  ActionFeedbackKind,
  { color: string; haptic: HapticPattern; icon: ReactElement }
> = {
  confirm: {
    color: 'blue',
    haptic: 'confirm',
    icon: <IconShieldCheck size={16} stroke={1.8} />,
  },
  error: {
    color: 'red',
    haptic: 'error',
    icon: <IconAlertCircle size={16} stroke={1.8} />,
  },
  success: {
    color: 'teal',
    haptic: 'success',
    icon: <IconCheck size={16} stroke={1.8} />,
  },
  warning: {
    color: 'yellow',
    haptic: 'warning',
    icon: <IconExclamationCircle size={16} stroke={1.8} />,
  },
};

export function useActionFeedback(): ActionFeedbackApi {
  const haptics = useHaptics();

  return useMemo(
    () => ({
      notify({ autoClose, id, kind, message, title }) {
        const config = FEEDBACK_CONFIG[kind];

        notifications.show({
          id,
          autoClose:
            autoClose ?? (kind === 'error' || kind === 'warning' ? 4000 : 2500),
          color: config.color,
          icon: config.icon,
          message,
          title,
        });

        void haptics.trigger(config.haptic);
      },
    }),
    [haptics]
  );
}
