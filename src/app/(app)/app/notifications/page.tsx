import { NotificationsLivePanel } from '@/components/notifications/notifications-live-panel';
import { NotificationDeliveryHealth } from '@/components/notifications/notification-delivery-health';
import { NotificationsCommandCenter } from '@/components/notifications/notifications-command-center';
import { TestNotificationButton } from '@/components/notifications/test-notification-button';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { getNotificationsPageData } from '@/lib/queries/notifications';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function NotificationsPage() {
  const [data, preferences] = await Promise.all([
    safeServerCall('getNotificationsPageData', () => getNotificationsPageData(), {
      userId: '', notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0, digestPreview: null, deliverySummary: { total: 0, sent: 0, failed: 0, pending: 0 },
    }),
    safeServerCall('getNotificationPreferences', () => getNotificationPreferences(), null),
  ]);

  return (
    <div className="space-y-4">
      <NotificationsCommandCenter
        unreadCount={data.unreadCount}
        deliverySummary={data.deliverySummary}
        preferences={preferences}
      />
      <div className="flex justify-end">
        <TestNotificationButton />
      </div>
      <NotificationsLivePanel
        userId={data.userId}
        initialNotifications={data.notifications}
        assignedTasks={data.assignedTasks}
        triggeredReminders={data.triggeredReminders}
        digestPreview={data.digestPreview}
        deliverySummary={data.deliverySummary}
      />
      <NotificationDeliveryHealth deliverySummary={data.deliverySummary} digestPreview={data.digestPreview} />
    </div>
  );
}
