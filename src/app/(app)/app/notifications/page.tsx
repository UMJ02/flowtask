export const dynamic = 'force-dynamic';

import { NotificationsLivePanel } from '@/components/notifications/notifications-live-panel';
import { NotificationDeliveryHealth } from '@/components/notifications/notification-delivery-health';
import { NotificationsCommandCenter } from '@/components/notifications/notifications-command-center';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { getAccountAccessSummary } from '@/lib/queries/account-access';
import { getNotificationsPageData } from '@/lib/queries/notifications';
import { safeServerCall } from '@/lib/runtime/safe-server';

type NotificationFilterKey =
  | 'all'
  | 'unread'
  | 'task'
  | 'project'
  | 'comment'
  | 'reminder'
  | 'delivery_failed'
  | 'delivery_pending'
  | 'delivery_sent';

const NOTIFICATION_FILTER_VALUES = new Set<NotificationFilterKey>([
  'all',
  'unread',
  'task',
  'project',
  'comment',
  'reminder',
  'delivery_failed',
  'delivery_pending',
  'delivery_sent',
]);

function parseNotificationFilter(value: string | undefined): NotificationFilterKey {
  if (value && NOTIFICATION_FILTER_VALUES.has(value as NotificationFilterKey)) {
    return value as NotificationFilterKey;
  }

  return 'all';
}

export default async function NotificationsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const initialFilter = parseNotificationFilter(typeof params.filter === 'string' ? params.filter : undefined);
  const initialSearch = typeof params.q === 'string' ? params.q : '';

  const [data, preferences, access] = await Promise.all([
    safeServerCall('getNotificationsPageData', () => getNotificationsPageData(), {
      userId: '', notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0, digestPreview: null, deliverySummary: { total: 0, sent: 0, failed: 0, pending: 0 },
    }),
    safeServerCall('getNotificationPreferences', () => getNotificationPreferences(), null),
    safeServerCall('getAccountAccessSummary', () => getAccountAccessSummary(), null),
  ]);

  return (
    <div className="space-y-4">
      <NotificationsCommandCenter
        unreadCount={data.unreadCount}
        deliverySummary={data.deliverySummary}
        preferences={preferences}
      />
      <NotificationsLivePanel
        userId={data.userId}
        initialNotifications={data.notifications}
        assignedTasks={data.assignedTasks}
        triggeredReminders={data.triggeredReminders}
        digestPreview={data.digestPreview}
        deliverySummary={data.deliverySummary}
        initialFilter={initialFilter}
        initialSearch={initialSearch}
      />
      <NotificationDeliveryHealth deliverySummary={data.deliverySummary} digestPreview={data.digestPreview} modeLabel={access?.currentMode === 'individual' ? 'Modo individual' : 'Workspace'} />
    </div>
  );
}
